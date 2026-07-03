<?php

namespace Tests\Feature\Web;

use App\Models\Ipal\IpalDailyLog;
use App\Models\Master\BatchItem;
use App\Models\Master\ChecklistItem;
use App\Models\Master\ChecklistTemplate;
use App\Models\Master\ProcessItem;
use App\Models\Master\ProcessSection;
use App\Models\Master\ProcessTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CatatanPengolahanLimbahAirSplitEntryTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_save_checklist_and_process_separately_in_same_day(): void
    {
        $operator = User::factory()->create([
            'external_id' => 'operator.split.01',
            'is_active' => true,
        ]);

        $checklistTemplate = ChecklistTemplate::query()->create([
            'name' => 'Checklist Split',
            'is_active' => true,
        ]);

        $checklistItem = ChecklistItem::query()->create([
            'template_id' => $checklistTemplate->id,
            'name' => 'Pompa Transfer 1',
            'category' => null,
            'standard_condition' => 'Berfungsi',
            'order_no' => 1,
            'is_active' => true,
        ]);

        $processTemplate = ProcessTemplate::query()->create([
            'name' => 'Process Split',
            'is_active' => true,
        ]);

        $processSection = ProcessSection::query()->create([
            'template_id' => $processTemplate->id,
            'name' => 'Ekualisasi',
            'order_no' => 1,
        ]);

        $processDecimalItem = ProcessItem::query()->create([
            'section_id' => $processSection->id,
            'name' => 'pH',
            'standard_condition' => '6-9',
            'input_type' => 'decimal_2',
            'order_no' => 1,
        ]);

        $processOptionItem = ProcessItem::query()->create([
            'section_id' => $processSection->id,
            'name' => 'Warna',
            'standard_condition' => 'Jernih',
            'input_type' => 'option',
            'order_no' => 2,
        ]);

        $processManualOptionItem = ProcessItem::query()->create([
            'section_id' => $processSection->id,
            'name' => 'Efluent',
            'standard_condition' => 'Warna putih pekat',
            'input_type' => 'option_with_manual',
            'order_no' => 3,
        ]);

        $processLegacyNumberItem = ProcessItem::query()->create([
            'section_id' => $processSection->id,
            'name' => 'Water Meter',
            'standard_condition' => 'Terbaca',
            'input_type' => 'number',
            'order_no' => 4,
        ]);

        $batchDurationItem = BatchItem::query()->create([
            'name' => 'Durasi (menit)',
            'input_type' => 'duration_minutes',
            'order_no' => 1,
        ]);

        $batchTextItem = BatchItem::query()->create([
            'name' => 'Warna',
            'input_type' => 'text',
            'order_no' => 2,
        ]);

        $date = '2026-04-29';

        $this->post('/dashboard/forms/catatan-pengolahan-limbah-air/checklist?user_id=operator.split.01', [
            'tanggal' => $date,
            'checklist' => [
                'template_id' => (string) $checklistTemplate->id,
                'values' => [
                    [
                        'item_id' => (string) $checklistItem->id,
                        'status' => 'OK',
                        'note' => 'Normal',
                    ],
                ],
            ],
        ])
            ->assertRedirect('/dashboard/forms/catatan-pengolahan-limbah-air/create?user_id=operator.split.01&tanggal=2026-04-29')
            ->assertSessionHasNoErrors();

        $logId = IpalDailyLog::query()
            ->whereDate('tanggal', $date)
            ->where('operator_id', $operator->id)
            ->value('id');

        $this->assertNotNull($logId);

        $this->assertDatabaseHas('ipal_checklist_values', [
            'item_id' => $checklistItem->id,
            'status' => 'OK',
        ]);

        $this->post('/dashboard/forms/catatan-pengolahan-limbah-air/process?user_id=operator.split.01', [
            'tanggal' => $date,
            'action' => 'SUBMIT',
            'has_mixing' => true,
            'process' => [
                'template_id' => (string) $processTemplate->id,
                'values' => [
                    [
                        'item_id' => $processDecimalItem->id,
                        'value_number' => 7.1,
                        'note' => 'Stabil',
                    ],
                    [
                        'item_id' => $processOptionItem->id,
                        'value_text' => 'Standar',
                        'note' => null,
                    ],
                    [
                        'item_id' => $processManualOptionItem->id,
                        'value_text' => 'Agak keruh',
                        'note' => 'Manual',
                    ],
                    [
                        'item_id' => $processLegacyNumberItem->id,
                        'value_number' => 123.45,
                        'note' => null,
                    ],
                ],
            ],
            'batch' => [
                [
                    'batch_no' => 1,
                    'values' => [
                        [
                            'item_id' => $batchDurationItem->id,
                            'value_number' => 45,
                        ],
                        [
                            'item_id' => $batchTextItem->id,
                            'value_text' => 'kuning muda',
                        ],
                    ],
                ],
            ],
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertDatabaseHas('ipal_process_logs', [
            'log_id' => $logId,
            'status' => 'SUBMITTED',
            'template_id' => $processTemplate->id,
        ]);

        $processLogId = DB::table('ipal_process_logs')->where('log_id', $logId)->value('id');

        $this->assertDatabaseHas('ipal_batches', [
            'process_log_id' => $processLogId,
            'batch_no' => 1,
        ]);

        $this->assertDatabaseHas('ipal_process_values', [
            'item_id' => $processDecimalItem->id,
            'value_text' => null,
        ]);

        $this->assertDatabaseHas('ipal_process_values', [
            'item_id' => $processOptionItem->id,
            'value_text' => 'Standar',
            'value_number' => null,
        ]);

        $this->assertDatabaseHas('ipal_process_values', [
            'item_id' => $processManualOptionItem->id,
            'value_text' => 'Agak keruh',
            'value_number' => null,
        ]);

        $this->assertDatabaseHas('ipal_batch_values', [
            'item_id' => $batchDurationItem->id,
            'value_text' => null,
        ]);
    }

    public function test_process_draft_does_not_require_each_value_to_be_filled_by_form_request(): void
    {
        User::factory()->create([
            'external_id' => 'operator.draft.01',
            'is_active' => true,
        ]);

        $checklistTemplate = ChecklistTemplate::query()->create([
            'name' => 'Checklist Draft',
            'is_active' => true,
        ]);

        ChecklistItem::query()->create([
            'template_id' => $checklistTemplate->id,
            'name' => 'Pompa Transfer 1',
            'category' => null,
            'standard_condition' => 'Berfungsi',
            'order_no' => 1,
            'is_active' => true,
        ]);

        $processTemplate = ProcessTemplate::query()->create([
            'name' => 'Draft Process',
            'is_active' => true,
        ]);

        $processSection = ProcessSection::query()->create([
            'template_id' => $processTemplate->id,
            'name' => 'Ekualisasi',
            'order_no' => 1,
        ]);

        $processItem = ProcessItem::query()->create([
            'section_id' => $processSection->id,
            'name' => 'pH',
            'standard_condition' => '6-9',
            'input_type' => 'decimal_2',
            'order_no' => 1,
        ]);

        $this->post('/dashboard/forms/catatan-pengolahan-limbah-air/process?user_id=operator.draft.01', [
            'tanggal' => '2026-04-29',
            'action' => 'DRAFT',
            'has_mixing' => false,
            'process' => [
                'template_id' => (string) $processTemplate->id,
                'values' => [
                    [
                        'item_id' => $processItem->id,
                        'value_text' => '',
                        'value_number' => '',
                        'note' => null,
                    ],
                ],
            ],
            'batch' => [],
        ])->assertRedirect()->assertSessionHasNoErrors();
    }

    public function test_integer_process_item_rejects_decimal_values(): void
    {
        User::factory()->create([
            'external_id' => 'operator.integer.01',
            'is_active' => true,
        ]);

        $checklistTemplate = ChecklistTemplate::query()->create([
            'name' => 'Checklist Integer',
            'is_active' => true,
        ]);
        ChecklistItem::query()->create([
            'template_id' => $checklistTemplate->id,
            'name' => 'Pompa Transfer',
            'category' => null,
            'standard_condition' => 'Berfungsi',
            'order_no' => 1,
            'is_active' => true,
        ]);

        $processTemplate = ProcessTemplate::query()->create([
            'name' => 'Process Integer',
            'is_active' => true,
        ]);
        $processSection = ProcessSection::query()->create([
            'template_id' => $processTemplate->id,
            'name' => 'Bio Indikator',
            'order_no' => 1,
        ]);
        $integerItem = ProcessItem::query()->create([
            'section_id' => $processSection->id,
            'name' => 'Jumlah ikan',
            'standard_condition' => 'Sesuai standar',
            'input_type' => 'integer',
            'order_no' => 1,
        ]);

        $payload = [
            'tanggal' => '2026-04-29',
            'action' => 'SUBMIT',
            'has_mixing' => false,
            'process' => [
                'template_id' => $processTemplate->id,
                'values' => [
                    [
                        'item_id' => $integerItem->id,
                        'value_number' => '4.5',
                        'note' => null,
                    ],
                ],
            ],
            'batch' => [],
        ];

        $this->post('/dashboard/forms/catatan-pengolahan-limbah-air/process?user_id=operator.integer.01', $payload)
            ->assertSessionHasErrors(['process.values']);

        $payload['process']['values'][0]['value_number'] = '4';

        $this->post('/dashboard/forms/catatan-pengolahan-limbah-air/process?user_id=operator.integer.01', $payload)
            ->assertRedirect()
            ->assertSessionHasNoErrors();
    }

    public function test_ipal_detail_attachment_urls_are_served_through_authorized_routes(): void
    {
        Storage::fake('public');

        $operator = User::factory()->create([
            'external_id' => 'operator.attachment.01',
            'is_active' => true,
        ]);
        $supervisor = User::factory()->create([
            'external_id' => 'supervisor.attachment.01',
            'is_active' => true,
        ]);
        Permission::query()->firstOrCreate([
            'name' => 'ipal.logs.approve',
            'guard_name' => 'web',
        ]);
        $supervisor->givePermissionTo('ipal.logs.approve');

        $checklistTemplate = ChecklistTemplate::query()->create([
            'name' => 'Checklist Attachment',
            'is_active' => true,
        ]);
        $checklistItem = ChecklistItem::query()->create([
            'template_id' => $checklistTemplate->id,
            'name' => 'Pompa Transfer',
            'category' => null,
            'standard_condition' => 'Berfungsi',
            'order_no' => 1,
            'is_active' => true,
        ]);

        $processTemplate = ProcessTemplate::query()->create([
            'name' => 'Process Attachment',
            'is_active' => true,
        ]);
        $processSection = ProcessSection::query()->create([
            'template_id' => $processTemplate->id,
            'name' => 'Ekualisasi',
            'order_no' => 1,
        ]);
        $processItem = ProcessItem::query()->create([
            'section_id' => $processSection->id,
            'name' => 'pH',
            'standard_condition' => '6-9',
            'input_type' => 'decimal_2',
            'order_no' => 1,
        ]);

        $date = '2026-04-29';

        $this->post('/dashboard/forms/catatan-pengolahan-limbah-air/checklist?user_id=operator.attachment.01', [
            'tanggal' => $date,
            'checklist' => [
                'template_id' => $checklistTemplate->id,
                'values' => [
                    [
                        'item_id' => $checklistItem->id,
                        'status' => 'OK',
                        'note' => null,
                        'attachment' => UploadedFile::fake()->image('checklist.jpg'),
                    ],
                ],
            ],
        ])->assertSessionHasNoErrors();

        $this->post('/dashboard/forms/catatan-pengolahan-limbah-air/process?user_id=operator.attachment.01', [
            'tanggal' => $date,
            'action' => 'SUBMIT',
            'has_mixing' => false,
            'process' => [
                'template_id' => $processTemplate->id,
                'values' => [
                    [
                        'item_id' => $processItem->id,
                        'value_number' => 7.12,
                        'note' => null,
                        'attachment' => UploadedFile::fake()->image('process.jpg'),
                    ],
                ],
            ],
            'batch' => [],
        ])->assertSessionHasNoErrors();

        $operatorResponse = $this->get('/dashboard/forms/catatan-pengolahan-limbah-air/create?user_id=operator.attachment.01&tanggal=2026-04-29');
        $operatorResponse->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('entryForm.checklist.items.0.attachment_original_name', 'checklist.jpg')
                ->where('entryForm.process.sections.0.items.0.attachment_original_name', 'process.jpg')
                ->etc()
            );

        $operatorChecklistUrl = $operatorResponse->inertiaProps('entryForm.checklist.items.0.attachment_url');
        $operatorProcessUrl = $operatorResponse->inertiaProps('entryForm.process.sections.0.items.0.attachment_url');

        $this->assertIsString($operatorChecklistUrl);
        $this->assertStringContainsString('/dashboard/forms/catatan-pengolahan-limbah-air/attachments/checklist/', $operatorChecklistUrl);
        $this->assertStringContainsString('user_id=operator.attachment.01', $operatorChecklistUrl);
        $this->get($operatorChecklistUrl)->assertOk();
        $this->get($operatorProcessUrl)->assertOk();

        $monthlyResponse = $this->get('/dashboard/forms/catatan-pengolahan-limbah-air/monthly/2026/4?user_id=operator.attachment.01');
        $monthlyResponse->assertOk();

        $checklistCell = collect($monthlyResponse->inertiaProps('monthlyDetail.checklist_matrix.0.cells'))
            ->firstWhere('date', $date);

        $this->assertSame('OK', $checklistCell['status']);
        $this->assertSame('checklist.jpg', $checklistCell['details'][0]['attachment_original_name']);
        $this->assertStringContainsString('user_id=operator.attachment.01', $checklistCell['details'][0]['attachment_url']);
        $this->get($checklistCell['details'][0]['attachment_url'])->assertOk();

        $logId = IpalDailyLog::query()
            ->whereDate('tanggal', $date)
            ->where('operator_id', $operator->id)
            ->value('id');

        $supervisorResponse = $this->get("/dashboard/forms/catatan-pengolahan-limbah-air/logs/{$logId}?user_id=supervisor.attachment.01");
        $supervisorProcessUrl = $supervisorResponse->inertiaProps('entryForm.process.sections.0.items.0.attachment_url');

        $this->assertIsString($supervisorProcessUrl);
        $this->assertStringContainsString('user_id=supervisor.attachment.01', $supervisorProcessUrl);
        $this->get($supervisorProcessUrl)->assertOk();
    }
}
