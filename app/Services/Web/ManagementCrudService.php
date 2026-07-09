<?php

namespace App\Services\Web;

use App\Models\Master\Department;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ManagementCrudService
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
        return $this->resolveModule($module)['permissions']['view'];
    }

    public function actionPermission(string $module, string $action): string
    {
        return $this->resolveModule($module)['permissions'][$action];
    }

    public function canPerform(?User $user, string $module, string $action): bool
    {
        if (! $user instanceof User) {
            return false;
        }

        $definition = $this->resolveModule($module);

        if ($action !== 'view' && ($definition['superadmin_only_mutation'] ?? false)) {
            return $user->hasRole('superadmin') && $user->can($definition['permissions'][$action]);
        }

        return $user->can($definition['permissions'][$action]);
    }

    /**
     * @return array<string, mixed>
     */
    public function buildPage(string $module, array $filters, User $viewer): array
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
                'create' => $this->canPerform($viewer, $module, 'create'),
                'update' => $this->canPerform($viewer, $module, 'update'),
                'delete' => $this->canPerform($viewer, $module, 'delete'),
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
                'fields' => $definition['fields'](),
                'values' => $this->formValues($definition, $editingRecord),
            ],
        ];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function validationRules(string $module, ?int $recordId = null): array
    {
        return $this->resolveModule($module)['rules']($recordId);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function store(string $module, array $payload): Model
    {
        $definition = $this->resolveModule($module);
        $modelClass = $definition['model'];
        $normalizedPayload = $this->normalizePayload($definition, $payload);

        /** @var Model $record */
        $record = $modelClass::query()->create($normalizedPayload['attributes']);
        $definition['after_save']($record, $normalizedPayload['relations']);

        return $record->fresh();
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function update(string $module, int $recordId, array $payload): Model
    {
        $definition = $this->resolveModule($module);
        $record = $this->findRecord($module, $recordId);
        $normalizedPayload = $this->normalizePayload($definition, $payload);

        $record->update($normalizedPayload['attributes']);
        $definition['after_save']($record, $normalizedPayload['relations']);

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
                    'view_permission' => $definition['permissions']['view'],
                ];
            })
            ->values()
            ->all();
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

    private function findRecord(string $module, int $recordId): Model
    {
        $definition = $this->resolveModule($module);
        $modelClass = $definition['model'];

        return $modelClass::query()->findOrFail($recordId);
    }

    /**
     * @param  Collection<int, Model>  $rows
     * @param  array<string, mixed>  $definition
     * @return array<int, array<string, mixed>>
     */
    private function mapRows(Collection $rows, array $definition): array
    {
        return $rows->map(fn (Model $row): array => [
            'id' => $row->getKey(),
            'values' => $definition['row']($row),
        ])->all();
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
     * @param  array<string, mixed>  $definition
     * @param  array<string, mixed>  $payload
     * @return array{attributes: array<string, mixed>, relations: array<string, mixed>}
     */
    private function normalizePayload(array $definition, array $payload): array
    {
        $relations = [];

        foreach ($definition['relation_fields'] as $field) {
            if (array_key_exists($field, $payload)) {
                $relations[$field] = $payload[$field];
                unset($payload[$field]);
            }
        }

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

        foreach ($definition['nullable_empty_fields'] ?? [] as $field) {
            if (array_key_exists($field, $payload) && ($payload[$field] === null || $payload[$field] === '')) {
                unset($payload[$field]);
            }
        }

        return [
            'attributes' => $payload,
            'relations' => $relations,
        ];
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function modules(): array
    {
        return [
            'users' => [
                'title' => 'User',
                'short_label' => 'User',
                'singular_label' => 'user',
                'description' => 'Kelola user internal, departemen, status aktif, dan role akses aplikasi.',
                'form_description' => 'Isi identitas user, pilih departemen, dan tentukan role akses.',
                'search_placeholder' => 'Cari nama, external ID, email, departemen, atau role',
                'permissions' => [
                    'view' => 'admin.users.view',
                    'create' => 'admin.users.create',
                    'update' => 'admin.users.update',
                    'delete' => 'admin.users.delete',
                ],
                'superadmin_only_mutation' => false,
                'model' => User::class,
                'integer_fields' => ['department_id'],
                'boolean_fields' => ['is_active'],
                'relation_fields' => ['roles'],
                'nullable_empty_fields' => ['password'],
                'defaults' => [
                    'external_id' => '',
                    'email' => '',
                    'password' => '',
                    'name' => '',
                    'department_id' => null,
                    'roles' => [],
                    'is_active' => true,
                ],
                'rules' => fn (?int $recordId): array => [
                    'external_id' => ['required', 'string', 'max:100', Rule::unique('users', 'external_id')->ignore($recordId)],
                    'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($recordId)],
                    'password' => [
                        $recordId === null ? 'required' : 'nullable',
                        'string',
                        Password::min(8),
                    ],
                    'name' => ['required', 'string', 'max:255'],
                    'department_id' => ['nullable', 'integer', 'exists:m_departments,id'],
                    'roles' => ['sometimes', 'array'],
                    'roles.*' => ['string', 'exists:roles,name'],
                    'is_active' => ['required', 'boolean'],
                ],
                'columns' => [
                    ['key' => 'external_id', 'label' => 'External ID'],
                    ['key' => 'name', 'label' => 'Nama'],
                    ['key' => 'email', 'label' => 'Email'],
                    ['key' => 'department', 'label' => 'Departemen'],
                    ['key' => 'roles', 'label' => 'Role'],
                    ['key' => 'status', 'label' => 'Status'],
                ],
                'query' => fn (): Builder => User::query()
                    ->with(['department:id,name', 'roles:id,name'])
                    ->orderByDesc('id'),
                'search' => function (Builder $query, string $search): void {
                    $query->where(function (Builder $innerQuery) use ($search): void {
                        $innerQuery
                            ->where('external_id', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhereHas('department', fn (Builder $departmentQuery): Builder => $departmentQuery->where('name', 'like', "%{$search}%"))
                            ->orWhereHas('roles', fn (Builder $roleQuery): Builder => $roleQuery->where('name', 'like', "%{$search}%"));
                    });
                },
                'row' => fn (User $record): array => [
                    'external_id' => $record->external_id,
                    'name' => $record->name,
                    'email' => $record->email ?: '-',
                    'department' => $record->department?->name ?? '-',
                    'roles' => $record->roles->pluck('name')->join(', ') ?: '-',
                    'status' => $record->is_active ? 'Aktif' : 'Nonaktif',
                ],
                'form_values' => fn (User $record): array => [
                    'external_id' => $record->external_id,
                    'email' => $record->email,
                    'password' => '',
                    'name' => $record->name,
                    'department_id' => $record->department_id,
                    'roles' => $record->roles->pluck('name')->values()->all(),
                    'is_active' => $record->is_active,
                ],
                'fields' => fn (): array => [
                    ['name' => 'external_id', 'label' => 'External ID', 'type' => 'text', 'required' => true],
                    ['name' => 'email', 'label' => 'Email', 'type' => 'text', 'required' => false],
                    ['name' => 'password', 'label' => 'Password Mobile (wajib saat tambah)', 'type' => 'password', 'required' => false],
                    ['name' => 'name', 'label' => 'Nama', 'type' => 'text', 'required' => true],
                    ['name' => 'department_id', 'label' => 'Departemen', 'type' => 'select', 'required' => false, 'options' => $this->departmentOptions()],
                    ['name' => 'roles', 'label' => 'Role', 'type' => 'multi-checkbox', 'required' => false, 'options' => $this->roleOptions()],
                    ['name' => 'is_active', 'label' => 'Status Aktif', 'type' => 'boolean-select', 'required' => true, 'options' => $this->booleanOptions()],
                ],
                'after_save' => function (Model $record, array $relations): void {
                    if ($record instanceof User && array_key_exists('roles', $relations)) {
                        $record->syncRoles($relations['roles']);
                    }
                },
            ],
            'roles' => [
                'title' => 'Role',
                'short_label' => 'Role',
                'singular_label' => 'role',
                'description' => 'Kelola role dan permission yang melekat pada role tersebut.',
                'form_description' => 'Tentukan nama role dan checklist permission yang diberikan.',
                'search_placeholder' => 'Cari nama role atau permission',
                'permissions' => [
                    'view' => 'admin.roles.view',
                    'create' => 'admin.roles.create',
                    'update' => 'admin.roles.update',
                    'delete' => 'admin.roles.delete',
                ],
                'superadmin_only_mutation' => false,
                'model' => Role::class,
                'integer_fields' => [],
                'boolean_fields' => [],
                'relation_fields' => ['permissions'],
                'defaults' => [
                    'name' => '',
                    'guard_name' => 'web',
                    'permissions' => [],
                ],
                'rules' => fn (?int $recordId): array => [
                    'name' => [
                        'required',
                        'string',
                        'max:255',
                        Rule::unique('roles', 'name')
                            ->where('guard_name', request()->input('guard_name', 'web'))
                            ->ignore($recordId),
                    ],
                    'guard_name' => ['required', 'string', 'max:255'],
                    'permissions' => ['sometimes', 'array'],
                    'permissions.*' => ['string', 'exists:permissions,name'],
                ],
                'columns' => [
                    ['key' => 'name', 'label' => 'Nama'],
                    ['key' => 'guard_name', 'label' => 'Guard'],
                    ['key' => 'permissions_count', 'label' => 'Jumlah Permission'],
                    ['key' => 'permissions', 'label' => 'Permission'],
                ],
                'query' => fn (): Builder => Role::query()
                    ->with('permissions:id,name,guard_name')
                    ->withCount('permissions')
                    ->orderBy('name'),
                'search' => function (Builder $query, string $search): void {
                    $query->where(function (Builder $innerQuery) use ($search): void {
                        $innerQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhereHas('permissions', fn (Builder $permissionQuery): Builder => $permissionQuery->where('name', 'like', "%{$search}%"));
                    });
                },
                'row' => fn (Role $record): array => [
                    'name' => $record->name,
                    'guard_name' => $record->guard_name,
                    'permissions_count' => (string) $record->permissions_count,
                    'permissions' => $record->permissions->pluck('name')->take(6)->join(', ') ?: '-',
                ],
                'form_values' => fn (Role $record): array => [
                    'name' => $record->name,
                    'guard_name' => $record->guard_name,
                    'permissions' => $record->permissions->pluck('name')->values()->all(),
                ],
                'fields' => fn (): array => [
                    ['name' => 'name', 'label' => 'Nama Role', 'type' => 'text', 'required' => true],
                    ['name' => 'guard_name', 'label' => 'Guard', 'type' => 'text', 'required' => true],
                    ['name' => 'permissions', 'label' => 'Permission', 'type' => 'multi-checkbox', 'required' => false, 'options' => $this->permissionOptions()],
                ],
                'after_save' => function (Model $record, array $relations): void {
                    if ($record instanceof Role && array_key_exists('permissions', $relations)) {
                        $record->syncPermissions($relations['permissions']);
                    }
                },
            ],
            'permissions' => [
                'title' => 'Permission',
                'short_label' => 'Permission',
                'singular_label' => 'permission',
                'description' => 'Kelola daftar permission aplikasi. Mutasi permission dibatasi untuk superadmin.',
                'form_description' => 'Tambahkan permission teknis baru hanya jika diperlukan oleh fitur backend.',
                'search_placeholder' => 'Cari nama permission atau guard',
                'permissions' => [
                    'view' => 'admin.permissions.view',
                    'create' => 'admin.permissions.create',
                    'update' => 'admin.permissions.update',
                    'delete' => 'admin.permissions.delete',
                ],
                'superadmin_only_mutation' => true,
                'model' => Permission::class,
                'integer_fields' => [],
                'boolean_fields' => [],
                'relation_fields' => [],
                'defaults' => [
                    'name' => '',
                    'guard_name' => 'web',
                ],
                'rules' => fn (?int $recordId): array => [
                    'name' => [
                        'required',
                        'string',
                        'max:255',
                        Rule::unique('permissions', 'name')
                            ->where('guard_name', request()->input('guard_name', 'web'))
                            ->ignore($recordId),
                    ],
                    'guard_name' => ['required', 'string', 'max:255'],
                ],
                'columns' => [
                    ['key' => 'name', 'label' => 'Nama'],
                    ['key' => 'guard_name', 'label' => 'Guard'],
                ],
                'query' => fn (): Builder => Permission::query()->orderBy('name'),
                'search' => function (Builder $query, string $search): void {
                    $query->where(fn (Builder $innerQuery): Builder => $innerQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('guard_name', 'like', "%{$search}%"));
                },
                'row' => fn (Permission $record): array => [
                    'name' => $record->name,
                    'guard_name' => $record->guard_name,
                ],
                'form_values' => fn (Permission $record): array => [
                    'name' => $record->name,
                    'guard_name' => $record->guard_name,
                ],
                'fields' => fn (): array => [
                    ['name' => 'name', 'label' => 'Nama Permission', 'type' => 'text', 'required' => true],
                    ['name' => 'guard_name', 'label' => 'Guard', 'type' => 'text', 'required' => true],
                ],
                'after_save' => fn (Model $record, array $relations): null => null,
            ],
            'departments' => [
                'title' => 'Departemen',
                'short_label' => 'Departemen',
                'singular_label' => 'departemen',
                'description' => 'Master departemen yang digunakan pada data user.',
                'form_description' => 'Kelola nama departemen dan status aktif.',
                'search_placeholder' => 'Cari nama departemen',
                'permissions' => [
                    'view' => 'admin.departments.view',
                    'create' => 'admin.departments.create',
                    'update' => 'admin.departments.update',
                    'delete' => 'admin.departments.delete',
                ],
                'superadmin_only_mutation' => false,
                'model' => Department::class,
                'integer_fields' => [],
                'boolean_fields' => ['is_active'],
                'relation_fields' => [],
                'defaults' => [
                    'name' => '',
                    'is_active' => true,
                ],
                'rules' => fn (?int $recordId): array => [
                    'name' => ['required', 'string', 'max:255', Rule::unique('m_departments', 'name')->ignore($recordId)],
                    'is_active' => ['required', 'boolean'],
                ],
                'columns' => [
                    ['key' => 'name', 'label' => 'Nama'],
                    ['key' => 'users_count', 'label' => 'Jumlah User'],
                    ['key' => 'status', 'label' => 'Status'],
                ],
                'query' => fn (): Builder => Department::query()
                    ->withCount('users')
                    ->orderBy('name'),
                'search' => function (Builder $query, string $search): void {
                    $query->where('name', 'like', "%{$search}%");
                },
                'row' => fn (Department $record): array => [
                    'name' => $record->name,
                    'users_count' => (string) $record->users_count,
                    'status' => $record->is_active ? 'Aktif' : 'Nonaktif',
                ],
                'form_values' => fn (Department $record): array => [
                    'name' => $record->name,
                    'is_active' => $record->is_active,
                ],
                'fields' => fn (): array => [
                    ['name' => 'name', 'label' => 'Nama Departemen', 'type' => 'text', 'required' => true],
                    ['name' => 'is_active', 'label' => 'Status Aktif', 'type' => 'boolean-select', 'required' => true, 'options' => $this->booleanOptions()],
                ],
                'after_save' => fn (Model $record, array $relations): null => null,
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
     * @return array<int, array{label: string, value: int}>
     */
    private function departmentOptions(): array
    {
        return Department::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Department $department): array => [
                'label' => $department->name,
                'value' => $department->id,
            ])
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: string}>
     */
    private function roleOptions(): array
    {
        return Role::query()
            ->orderBy('name')
            ->get(['name'])
            ->map(fn (Role $role): array => [
                'label' => $role->name,
                'value' => $role->name,
            ])
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: string, group: string}>
     */
    private function permissionOptions(): array
    {
        return Permission::query()
            ->orderBy('name')
            ->get(['name'])
            ->map(fn (Permission $permission): array => [
                'label' => $permission->name,
                'value' => $permission->name,
                'group' => str($permission->name)->before('.')->toString(),
            ])
            ->all();
    }
}
