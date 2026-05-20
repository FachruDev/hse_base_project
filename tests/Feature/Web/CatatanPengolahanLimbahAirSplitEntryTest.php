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
use Illuminate\Support\Facades\DB;
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

        $processNumberItem = ProcessItem::query()->create([
            'section_id' => $processSection->id,
            'name' => 'pH',
            'standard_condition' => '6-9',
            'input_type' => 'number',
            'order_no' => 1,
        ]);

        $processTextItem = ProcessItem::query()->create([
            'section_id' => $processSection->id,
            'name' => 'Warna',
            'standard_condition' => 'Jernih',
            'input_type' => 'text',
            'order_no' => 2,
        ]);

        $batchNumberItem = BatchItem::query()->create([
            'name' => 'pH',
            'input_type' => 'number',
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
                'template_id' => $checklistTemplate->id,
                'values' => [
                    [
                        'item_id' => $checklistItem->id,
                        'status' => 'OK',
                        'note' => 'Normal',
                    ],
                ],
            ],
        ])
            ->assertRedirect('/dashboard/forms/catatan-pengolahan-limbah-air/create?user_id=operator.split.01')
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
                'template_id' => $processTemplate->id,
                'values' => [
                    [
                        'item_id' => $processNumberItem->id,
                        'value_number' => 7.1,
                        'note' => 'Stabil',
                    ],
                    [
                        'item_id' => $processTextItem->id,
                        'value_text' => 'jernih',
                        'note' => null,
                    ],
                ],
            ],
            'batch' => [
                [
                    'batch_no' => 1,
                    'values' => [
                        [
                            'item_id' => $batchNumberItem->id,
                            'value_number' => 6.9,
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
    }
}
