<?php

namespace App\Services\Web;

use App\Models\B3Storage\B3StorageInitiatorDepartment;
use App\Models\B3Storage\B3StorageWasteType;
use App\Models\Master\BatchItem;
use App\Models\Master\ChecklistItem;
use App\Models\Master\ChecklistTemplate;
use App\Models\Master\ProcessItem;
use App\Models\Master\ProcessSection;
use App\Models\Master\ProcessTemplate;
use App\Support\Ipal\InputType;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class MasterDataCrudService
{
    /**
     * @return array<int, string>
     */
    public function moduleKeys(): array
    {
        return array_keys($this->modules());
    }

    public function viewPermission(string $module): string
    {
        return $this->resolveModule($module)['view_permission'];
    }

    public function managePermission(string $module): string
    {
        return $this->resolveModule($module)['manage_permission'];
    }

    /**
     * @return array<string, mixed>
     */
    public function buildPage(string $module, array $filters, bool $canManage): array
    {
        $definition = $this->resolveModule($module);
        $editingRecord = $filters['edit'] !== null ? $this->findRecord($module, $filters['edit']) : null;

        $query = $this->applySearch($definition, $filters['search']);
        $paginator = $query->paginate($filters['per_page'])->withQueryString();

        return [
            'module' => [
                'key' => $module,
                'title' => $definition['title'],
                'description' => $definition['description'],
                'singular_label' => $definition['singular_label'],
                'search_placeholder' => $definition['search_placeholder'],
            ],
            'modules' => $this->moduleMenu(),
            'capabilities' => [
                'manage' => $canManage,
            ],
            'filters' => $filters,
            'table' => [
                'columns' => $definition['columns'],
                'rows' => $this->mapRows($paginator->getCollection(), $definition),
                'meta' => $this->mapPagination($paginator),
            ],
            'form' => [
                'mode' => $editingRecord instanceof Model ? 'edit' : 'create',
                'editing_id' => $editingRecord?->getKey(),
                'title' => $editingRecord instanceof Model
                    ? 'Ubah '.$definition['singular_label']
                    : 'Tambah '.$definition['singular_label'],
                'description' => $definition['form_description'],
                'submit_label' => $editingRecord instanceof Model ? 'Perbarui Data' : 'Simpan Data',
                'cancel_edit' => $editingRecord instanceof Model,
                'fields' => $this->fieldsForModule($module),
                'values' => $this->formValues($definition, $editingRecord),
            ],
        ];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function validationRules(string $module): array
    {
        return $this->resolveModule($module)['rules'];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function store(string $module, array $payload): Model
    {
        $definition = $this->resolveModule($module);
        $modelClass = $definition['model'];

        return $modelClass::query()->create($this->normalizePayload($module, $payload));
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function update(string $module, int $recordId, array $payload): Model
    {
        $record = $this->findRecord($module, $recordId);
        $record->update($this->normalizePayload($module, $payload));

        return $record->fresh();
    }

    public function delete(string $module, int $recordId): void
    {
        $this->findRecord($module, $recordId)->delete();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function moduleMenu(): array
    {
        return collect($this->modules())
            ->map(function (array $definition, string $key): array {
                return [
                    'key' => $key,
                    'title' => $definition['title'],
                    'short_label' => $definition['short_label'],
                    'view_permission' => $definition['view_permission'],
                ];
            })
            ->values()
            ->all();
    }

    private function findRecord(string $module, int $recordId): Model
    {
        $definition = $this->resolveModule($module);
        $modelClass = $definition['model'];

        return $modelClass::query()->findOrFail($recordId);
    }

    /**
     * @param  array<string, mixed>  $definition
     */
    private function applySearch(array $definition, string $search): Builder
    {
        /** @var Builder $query */
        $query = $definition['query']();

        if ($search === '') {
            return $query;
        }

        $definition['search']($query, $search);

        return $query;
    }

    /**
     * @param  Collection<int, Model>  $rows
     * @param  array<string, mixed>  $definition
     * @return array<int, array<string, mixed>>
     */
    private function mapRows(Collection $rows, array $definition): array
    {
        return $rows->map(function (Model $row) use ($definition): array {
            return [
                'id' => $row->getKey(),
                'values' => $definition['row']($row),
            ];
        })->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function mapPagination(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'links' => $paginator->linkCollection()->toArray(),
        ];
    }

    /**
     * @param  array<string, mixed>  $definition
     * @return array<string, mixed>
     */
    private function formValues(array $definition, ?Model $editingRecord): array
    {
        if (! $editingRecord instanceof Model) {
            return $definition['defaults'];
        }

        return $definition['form_values']($editingRecord);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function fieldsForModule(string $module): array
    {
        return $this->resolveModule($module)['fields']();
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function normalizePayload(string $module, array $payload): array
    {
        $definition = $this->resolveModule($module);

        foreach ($definition['integer_fields'] as $field) {
            if (array_key_exists($field, $payload) && $payload[$field] !== null && $payload[$field] !== '') {
                $payload[$field] = (int) $payload[$field];
            }
        }

        foreach ($definition['boolean_fields'] as $field) {
            if (array_key_exists($field, $payload)) {
                $payload[$field] = filter_var($payload[$field], FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false;
            }
        }

        return $payload;
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function modules(): array
    {
        return [
            'checklist-templates' => [
                'title' => 'Template Checklist',
                'short_label' => 'Template Checklist',
                'singular_label' => 'template checklist',
                'description' => 'Master template checklist untuk inspeksi harian.',
                'form_description' => 'Kelola nama dan status aktif template checklist.',
                'search_placeholder' => 'Cari nama template checklist',
                'view_permission' => 'master.checklist.view',
                'manage_permission' => 'master.checklist.manage',
                'model' => ChecklistTemplate::class,
                'integer_fields' => [],
                'boolean_fields' => ['is_active'],
                'defaults' => [
                    'name' => '',
                    'is_active' => true,
                ],
                'rules' => [
                    'name' => ['required', 'string', 'max:255'],
                    'is_active' => ['required', 'boolean'],
                ],
                'columns' => [
                    ['key' => 'name', 'label' => 'Nama'],
                    ['key' => 'status', 'label' => 'Status'],
                    ['key' => 'items_count', 'label' => 'Jumlah Item'],
                ],
                'query' => fn (): Builder => ChecklistTemplate::query()
                    ->withCount('items')
                    ->orderBy('name')
                    ->orderBy('id'),
                'search' => function (Builder $query, string $search): void {
                    $query->where('name', 'like', "%{$search}%");
                },
                'row' => function (ChecklistTemplate $record): array {
                    return [
                        'name' => $record->name,
                        'status' => $record->is_active ? 'Aktif' : 'Nonaktif',
                        'items_count' => (string) $record->items_count,
                    ];
                },
                'form_values' => function (ChecklistTemplate $record): array {
                    return [
                        'name' => $record->name,
                        'is_active' => $record->is_active,
                    ];
                },
                'fields' => fn (): array => [
                    [
                        'name' => 'name',
                        'label' => 'Nama Template',
                        'type' => 'text',
                        'required' => true,
                        'placeholder' => 'Contoh: Checklist Harian IPAL',
                    ],
                    [
                        'name' => 'is_active',
                        'label' => 'Status Aktif',
                        'type' => 'boolean-select',
                        'required' => true,
                        'options' => $this->booleanOptions(),
                    ],
                ],
            ],
            'checklist-items' => [
                'title' => 'Item Checklist',
                'short_label' => 'Item Checklist',
                'singular_label' => 'item checklist',
                'description' => 'Master item checklist berdasarkan template aktif.',
                'form_description' => 'Tentukan template, nama item, kategori, urutan, dan kondisi standar.',
                'search_placeholder' => 'Cari item, kategori, atau template',
                'view_permission' => 'master.checklist.view',
                'manage_permission' => 'master.checklist.manage',
                'model' => ChecklistItem::class,
                'integer_fields' => ['template_id', 'order_no'],
                'boolean_fields' => ['is_active'],
                'defaults' => [
                    'template_id' => null,
                    'name' => '',
                    'category' => '',
                    'standard_condition' => '',
                    'order_no' => 1,
                    'is_active' => true,
                ],
                'rules' => [
                    'template_id' => ['required', 'integer', 'exists:m_checklist_templates,id'],
                    'name' => ['required', 'string', 'max:255'],
                    'category' => ['nullable', 'string', 'max:255'],
                    'standard_condition' => ['nullable', 'string'],
                    'order_no' => ['required', 'integer', 'min:1'],
                    'is_active' => ['required', 'boolean'],
                ],
                'columns' => [
                    ['key' => 'template', 'label' => 'Template'],
                    ['key' => 'name', 'label' => 'Nama Item'],
                    ['key' => 'category', 'label' => 'Kategori'],
                    ['key' => 'order_no', 'label' => 'Urutan'],
                    ['key' => 'status', 'label' => 'Status'],
                ],
                'query' => fn (): Builder => ChecklistItem::query()
                    ->with('template:id,name')
                    ->orderBy('template_id')
                    ->orderBy('order_no')
                    ->orderBy('id'),
                'search' => function (Builder $query, string $search): void {
                    $query->where(function (Builder $innerQuery) use ($search): void {
                        $innerQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('category', 'like', "%{$search}%")
                            ->orWhereHas('template', function (Builder $templateQuery) use ($search): void {
                                $templateQuery->where('name', 'like', "%{$search}%");
                            });
                    });
                },
                'row' => function (ChecklistItem $record): array {
                    return [
                        'template' => $record->template?->name ?? '-',
                        'name' => $record->name,
                        'category' => $record->category ?: '-',
                        'order_no' => (string) $record->order_no,
                        'status' => $record->is_active ? 'Aktif' : 'Nonaktif',
                    ];
                },
                'form_values' => function (ChecklistItem $record): array {
                    return [
                        'template_id' => $record->template_id,
                        'name' => $record->name,
                        'category' => $record->category,
                        'standard_condition' => $record->standard_condition,
                        'order_no' => $record->order_no,
                        'is_active' => $record->is_active,
                    ];
                },
                'fields' => fn (): array => [
                    [
                        'name' => 'template_id',
                        'label' => 'Template Checklist',
                        'type' => 'select',
                        'required' => true,
                        'options' => $this->checklistTemplateOptions(),
                    ],
                    [
                        'name' => 'name',
                        'label' => 'Nama Item',
                        'type' => 'text',
                        'required' => true,
                    ],
                    [
                        'name' => 'category',
                        'label' => 'Kategori',
                        'type' => 'text',
                        'required' => false,
                    ],
                    [
                        'name' => 'standard_condition',
                        'label' => 'Kondisi Standar',
                        'type' => 'textarea',
                        'required' => false,
                    ],
                    [
                        'name' => 'order_no',
                        'label' => 'Urutan',
                        'type' => 'number',
                        'required' => true,
                    ],
                    [
                        'name' => 'is_active',
                        'label' => 'Status Aktif',
                        'type' => 'boolean-select',
                        'required' => true,
                        'options' => $this->booleanOptions(),
                    ],
                ],
            ],
            'process-templates' => [
                'title' => 'Template Proses',
                'short_label' => 'Template Proses',
                'singular_label' => 'template proses',
                'description' => 'Master template proses untuk pencatatan operasi IPAL.',
                'form_description' => 'Kelola template proses aktif yang dipakai dalam form harian.',
                'search_placeholder' => 'Cari nama template proses',
                'view_permission' => 'master.process.view',
                'manage_permission' => 'master.process.manage',
                'model' => ProcessTemplate::class,
                'integer_fields' => [],
                'boolean_fields' => ['is_active'],
                'defaults' => [
                    'name' => '',
                    'is_active' => true,
                ],
                'rules' => [
                    'name' => ['required', 'string', 'max:255'],
                    'is_active' => ['required', 'boolean'],
                ],
                'columns' => [
                    ['key' => 'name', 'label' => 'Nama'],
                    ['key' => 'status', 'label' => 'Status'],
                    ['key' => 'sections_count', 'label' => 'Jumlah Section'],
                ],
                'query' => fn (): Builder => ProcessTemplate::query()
                    ->withCount('sections')
                    ->orderBy('name')
                    ->orderBy('id'),
                'search' => function (Builder $query, string $search): void {
                    $query->where('name', 'like', "%{$search}%");
                },
                'row' => function (ProcessTemplate $record): array {
                    return [
                        'name' => $record->name,
                        'status' => $record->is_active ? 'Aktif' : 'Nonaktif',
                        'sections_count' => (string) $record->sections_count,
                    ];
                },
                'form_values' => function (ProcessTemplate $record): array {
                    return [
                        'name' => $record->name,
                        'is_active' => $record->is_active,
                    ];
                },
                'fields' => fn (): array => [
                    [
                        'name' => 'name',
                        'label' => 'Nama Template',
                        'type' => 'text',
                        'required' => true,
                    ],
                    [
                        'name' => 'is_active',
                        'label' => 'Status Aktif',
                        'type' => 'boolean-select',
                        'required' => true,
                        'options' => $this->booleanOptions(),
                    ],
                ],
            ],
            'process-sections' => [
                'title' => 'Section Proses',
                'short_label' => 'Section Proses',
                'singular_label' => 'section proses',
                'description' => 'Master section proses yang terhubung ke template proses.',
                'form_description' => 'Tentukan template proses, nama section, dan urutan tampil.',
                'search_placeholder' => 'Cari section atau template proses',
                'view_permission' => 'master.process.view',
                'manage_permission' => 'master.process.manage',
                'model' => ProcessSection::class,
                'integer_fields' => ['template_id', 'order_no'],
                'boolean_fields' => [],
                'defaults' => [
                    'template_id' => null,
                    'name' => '',
                    'order_no' => 1,
                ],
                'rules' => [
                    'template_id' => ['required', 'integer', 'exists:m_process_templates,id'],
                    'name' => ['required', 'string', 'max:255'],
                    'order_no' => ['required', 'integer', 'min:1'],
                ],
                'columns' => [
                    ['key' => 'template', 'label' => 'Template'],
                    ['key' => 'name', 'label' => 'Nama Section'],
                    ['key' => 'order_no', 'label' => 'Urutan'],
                ],
                'query' => fn (): Builder => ProcessSection::query()
                    ->with('template:id,name')
                    ->orderBy('template_id')
                    ->orderBy('order_no')
                    ->orderBy('id'),
                'search' => function (Builder $query, string $search): void {
                    $query->where(function (Builder $innerQuery) use ($search): void {
                        $innerQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhereHas('template', function (Builder $templateQuery) use ($search): void {
                                $templateQuery->where('name', 'like', "%{$search}%");
                            });
                    });
                },
                'row' => function (ProcessSection $record): array {
                    return [
                        'template' => $record->template?->name ?? '-',
                        'name' => $record->name,
                        'order_no' => (string) $record->order_no,
                    ];
                },
                'form_values' => function (ProcessSection $record): array {
                    return [
                        'template_id' => $record->template_id,
                        'name' => $record->name,
                        'order_no' => $record->order_no,
                    ];
                },
                'fields' => fn (): array => [
                    [
                        'name' => 'template_id',
                        'label' => 'Template Proses',
                        'type' => 'select',
                        'required' => true,
                        'options' => $this->processTemplateOptions(),
                    ],
                    [
                        'name' => 'name',
                        'label' => 'Nama Section',
                        'type' => 'text',
                        'required' => true,
                    ],
                    [
                        'name' => 'order_no',
                        'label' => 'Urutan',
                        'type' => 'number',
                        'required' => true,
                    ],
                ],
            ],
            'process-items' => [
                'title' => 'Item Proses',
                'short_label' => 'Item Proses',
                'singular_label' => 'item proses',
                'description' => 'Master item proses yang terhubung ke section proses.',
                'form_description' => 'Tentukan section, nama item, jenis input, kondisi standar, dan urutan tampil.',
                'search_placeholder' => 'Cari item proses atau section',
                'view_permission' => 'master.process.view',
                'manage_permission' => 'master.process.manage',
                'model' => ProcessItem::class,
                'integer_fields' => ['section_id', 'order_no'],
                'boolean_fields' => [],
                'defaults' => [
                    'section_id' => null,
                    'name' => '',
                    'standard_condition' => '',
                    'input_type' => 'text',
                    'order_no' => 1,
                ],
                'rules' => [
                    'section_id' => ['required', 'integer', 'exists:m_process_sections,id'],
                    'name' => ['required', 'string', 'max:255'],
                    'standard_condition' => ['nullable', 'string'],
                    'input_type' => ['required', Rule::in(InputType::allowedForMaster())],
                    'order_no' => ['required', 'integer', 'min:1'],
                ],
                'columns' => [
                    ['key' => 'section', 'label' => 'Section'],
                    ['key' => 'name', 'label' => 'Nama Item'],
                    ['key' => 'input_type', 'label' => 'Tipe Input'],
                    ['key' => 'order_no', 'label' => 'Urutan'],
                ],
                'query' => fn (): Builder => ProcessItem::query()
                    ->with('section:id,template_id,name')
                    ->orderBy('section_id')
                    ->orderBy('order_no')
                    ->orderBy('id'),
                'search' => function (Builder $query, string $search): void {
                    $query->where(function (Builder $innerQuery) use ($search): void {
                        $innerQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('input_type', 'like', "%{$search}%")
                            ->orWhereHas('section', function (Builder $sectionQuery) use ($search): void {
                                $sectionQuery->where('name', 'like', "%{$search}%");
                            });
                    });
                },
                'row' => function (ProcessItem $record): array {
                    return [
                        'section' => $record->section?->name ?? '-',
                        'name' => $record->name,
                        'input_type' => strtoupper($record->input_type),
                        'order_no' => (string) $record->order_no,
                    ];
                },
                'form_values' => function (ProcessItem $record): array {
                    return [
                        'section_id' => $record->section_id,
                        'name' => $record->name,
                        'standard_condition' => $record->standard_condition,
                        'input_type' => $record->input_type,
                        'order_no' => $record->order_no,
                    ];
                },
                'fields' => fn (): array => [
                    [
                        'name' => 'section_id',
                        'label' => 'Section Proses',
                        'type' => 'select',
                        'required' => true,
                        'options' => $this->processSectionOptions(),
                    ],
                    [
                        'name' => 'name',
                        'label' => 'Nama Item',
                        'type' => 'text',
                        'required' => true,
                    ],
                    [
                        'name' => 'standard_condition',
                        'label' => 'Kondisi Standar',
                        'type' => 'textarea',
                        'required' => false,
                    ],
                    [
                        'name' => 'input_type',
                        'label' => 'Tipe Input',
                        'type' => 'select',
                        'required' => true,
                        'options' => $this->inputTypeOptions(),
                    ],
                    [
                        'name' => 'order_no',
                        'label' => 'Urutan',
                        'type' => 'number',
                        'required' => true,
                    ],
                ],
            ],
            'batch-items' => [
                'title' => 'Item Batch',
                'short_label' => 'Item Batch',
                'singular_label' => 'item batch',
                'description' => 'Master item batch untuk kebutuhan mixing atau pencatatan batch.',
                'form_description' => 'Kelola nama item batch, tipe input, dan urutan tampil.',
                'search_placeholder' => 'Cari item batch',
                'view_permission' => 'master.batch.view',
                'manage_permission' => 'master.batch.manage',
                'model' => BatchItem::class,
                'integer_fields' => ['order_no'],
                'boolean_fields' => [],
                'defaults' => [
                    'name' => '',
                    'input_type' => 'text',
                    'order_no' => 1,
                ],
                'rules' => [
                    'name' => ['required', 'string', 'max:255'],
                    'input_type' => ['required', Rule::in(InputType::allowedForMaster())],
                    'order_no' => ['required', 'integer', 'min:1'],
                ],
                'columns' => [
                    ['key' => 'name', 'label' => 'Nama Item'],
                    ['key' => 'input_type', 'label' => 'Tipe Input'],
                    ['key' => 'order_no', 'label' => 'Urutan'],
                ],
                'query' => fn (): Builder => BatchItem::query()
                    ->orderBy('order_no')
                    ->orderBy('id'),
                'search' => function (Builder $query, string $search): void {
                    $query->where('name', 'like', "%{$search}%");
                },
                'row' => function (BatchItem $record): array {
                    return [
                        'name' => $record->name,
                        'input_type' => strtoupper($record->input_type),
                        'order_no' => (string) $record->order_no,
                    ];
                },
                'form_values' => function (BatchItem $record): array {
                    return [
                        'name' => $record->name,
                        'input_type' => $record->input_type,
                        'order_no' => $record->order_no,
                    ];
                },
                'fields' => fn (): array => [
                    [
                        'name' => 'name',
                        'label' => 'Nama Item',
                        'type' => 'text',
                        'required' => true,
                    ],
                    [
                        'name' => 'input_type',
                        'label' => 'Tipe Input',
                        'type' => 'select',
                        'required' => true,
                        'options' => $this->inputTypeOptions(),
                    ],
                    [
                        'name' => 'order_no',
                        'label' => 'Urutan',
                        'type' => 'number',
                        'required' => true,
                    ],
                ],
            ],
            'b3-waste-types' => [
                'title' => 'Jenis Limbah B3',
                'short_label' => 'Jenis Limbah B3',
                'singular_label' => 'jenis limbah B3',
                'description' => 'Master jenis limbah untuk form penyimpanan limbah B3.',
                'form_description' => 'Kelola daftar jenis limbah yang tampil di form B3.',
                'search_placeholder' => 'Cari jenis limbah B3',
                'view_permission' => 'b3storage.master.view',
                'manage_permission' => 'b3storage.master.manage',
                'model' => B3StorageWasteType::class,
                'integer_fields' => ['order_no'],
                'boolean_fields' => ['is_active'],
                'defaults' => [
                    'name' => '',
                    'order_no' => 1,
                    'is_active' => true,
                ],
                'rules' => [
                    'name' => ['required', 'string', 'max:255'],
                    'order_no' => ['required', 'integer', 'min:1'],
                    'is_active' => ['required', 'boolean'],
                ],
                'columns' => [
                    ['key' => 'name', 'label' => 'Nama'],
                    ['key' => 'order_no', 'label' => 'Urutan'],
                    ['key' => 'status', 'label' => 'Status'],
                ],
                'query' => fn (): Builder => B3StorageWasteType::query()
                    ->orderBy('order_no')
                    ->orderBy('id'),
                'search' => function (Builder $query, string $search): void {
                    $query->where('name', 'like', "%{$search}%");
                },
                'row' => function (B3StorageWasteType $record): array {
                    return [
                        'name' => $record->name,
                        'order_no' => (string) $record->order_no,
                        'status' => $record->is_active ? 'Aktif' : 'Nonaktif',
                    ];
                },
                'form_values' => function (B3StorageWasteType $record): array {
                    return [
                        'name' => $record->name,
                        'order_no' => $record->order_no,
                        'is_active' => $record->is_active,
                    ];
                },
                'fields' => fn (): array => [
                    [
                        'name' => 'name',
                        'label' => 'Nama Jenis Limbah',
                        'type' => 'text',
                        'required' => true,
                    ],
                    [
                        'name' => 'order_no',
                        'label' => 'Urutan',
                        'type' => 'number',
                        'required' => true,
                    ],
                    [
                        'name' => 'is_active',
                        'label' => 'Status Aktif',
                        'type' => 'boolean-select',
                        'required' => true,
                        'options' => $this->booleanOptions(),
                    ],
                ],
            ],
            'b3-initiator-departments' => [
                'title' => 'Dept Inisiator B3',
                'short_label' => 'Dept Inisiator B3',
                'singular_label' => 'dept inisiator B3',
                'description' => 'Master departemen inisiator untuk form penyimpanan limbah B3.',
                'form_description' => 'Kelola daftar dept inisiator yang tampil di form B3.',
                'search_placeholder' => 'Cari dept inisiator B3',
                'view_permission' => 'b3storage.master.view',
                'manage_permission' => 'b3storage.master.manage',
                'model' => B3StorageInitiatorDepartment::class,
                'integer_fields' => ['order_no'],
                'boolean_fields' => ['is_active'],
                'defaults' => [
                    'name' => '',
                    'order_no' => 1,
                    'is_active' => true,
                ],
                'rules' => [
                    'name' => ['required', 'string', 'max:255'],
                    'order_no' => ['required', 'integer', 'min:1'],
                    'is_active' => ['required', 'boolean'],
                ],
                'columns' => [
                    ['key' => 'name', 'label' => 'Nama'],
                    ['key' => 'order_no', 'label' => 'Urutan'],
                    ['key' => 'status', 'label' => 'Status'],
                ],
                'query' => fn (): Builder => B3StorageInitiatorDepartment::query()
                    ->orderBy('order_no')
                    ->orderBy('id'),
                'search' => function (Builder $query, string $search): void {
                    $query->where('name', 'like', "%{$search}%");
                },
                'row' => function (B3StorageInitiatorDepartment $record): array {
                    return [
                        'name' => $record->name,
                        'order_no' => (string) $record->order_no,
                        'status' => $record->is_active ? 'Aktif' : 'Nonaktif',
                    ];
                },
                'form_values' => function (B3StorageInitiatorDepartment $record): array {
                    return [
                        'name' => $record->name,
                        'order_no' => $record->order_no,
                        'is_active' => $record->is_active,
                    ];
                },
                'fields' => fn (): array => [
                    [
                        'name' => 'name',
                        'label' => 'Nama Dept Inisiator',
                        'type' => 'text',
                        'required' => true,
                    ],
                    [
                        'name' => 'order_no',
                        'label' => 'Urutan',
                        'type' => 'number',
                        'required' => true,
                    ],
                    [
                        'name' => 'is_active',
                        'label' => 'Status Aktif',
                        'type' => 'boolean-select',
                        'required' => true,
                        'options' => $this->booleanOptions(),
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function resolveModule(string $module): array
    {
        $definition = $this->modules()[$module] ?? null;

        if (! is_array($definition)) {
            throw new NotFoundHttpException;
        }

        return $definition;
    }

    /**
     * @return array<int, array{label: string, value: bool}>
     */
    private function booleanOptions(): array
    {
        return [
            ['label' => 'Aktif', 'value' => true],
            ['label' => 'Nonaktif', 'value' => false],
        ];
    }

    /**
     * @return array<int, array{label: string, value: string}>
     */
    private function inputTypeOptions(): array
    {
        return InputType::optionsForMaster();
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    private function checklistTemplateOptions(): array
    {
        return ChecklistTemplate::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (ChecklistTemplate $template): array => [
                'label' => $template->name,
                'value' => $template->id,
            ])
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    private function processTemplateOptions(): array
    {
        return ProcessTemplate::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (ProcessTemplate $template): array => [
                'label' => $template->name,
                'value' => $template->id,
            ])
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    private function processSectionOptions(): array
    {
        return ProcessSection::query()
            ->with('template:id,name')
            ->orderBy('template_id')
            ->orderBy('order_no')
            ->get(['id', 'template_id', 'name'])
            ->map(fn (ProcessSection $section): array => [
                'label' => trim(($section->template?->name ? $section->template->name.' - ' : '').$section->name),
                'value' => $section->id,
            ])
            ->all();
    }
}
