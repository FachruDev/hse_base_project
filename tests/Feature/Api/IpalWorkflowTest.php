<?php

namespace Tests\Feature\Api;

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

class IpalWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_execute_draft_submit_approve_workflow(): void
    {
        $operator = User::factory()->create([
            'external_id' => 'operator.01',
            'name' => 'Operator 01',
            'is_active' => true,
        ]);

        $supervisor = User::factory()->create([
            'external_id' => 'supervisor.01',
            'name' => 'Supervisor 01',
            'is_active' => true,
        ]);

        $checklistTemplate = ChecklistTemplate::query()->create([
            'name' => 'Checklist Unit A',
            'is_active' => true,
        ]);

        $checklistItem = ChecklistItem::query()->create([
            'template_id' => $checklistTemplate->id,
            'name' => 'Pompa Transfer 1',
            'category' => 'Pompa',
            'standard_condition' => 'Berfungsi',
            'order_no' => 1,
            'is_active' => true,
        ]);

        $processTemplate = ProcessTemplate::query()->create([
            'name' => 'Proses Unit A',
            'is_active' => true,
        ]);

        $processSection = ProcessSection::query()->create([
            'template_id' => $processTemplate->id,
            'name' => 'Sedimentasi',
            'order_no' => 1,
        ]);

        $processNumberItem = ProcessItem::query()->create([
            'section_id' => $processSection->id,
            'name' => 'pH',
            'standard_condition' => '6 - 9',
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
            'name' => 'Jumlah Chemical',
            'input_type' => 'number',
            'order_no' => 1,
        ]);

        $batchTextItem = BatchItem::query()->create([
            'name' => 'Warna Batch',
            'input_type' => 'text',
            'order_no' => 2,
        ]);

        $payload = [
            'tanggal' => '2026-04-30',
            'action' => 'DRAFT',
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
            'process' => [
                'template_id' => $processTemplate->id,
                'values' => [
                    [
                        'item_id' => $processNumberItem->id,
                        'value_number' => 7.1200,
                        'note' => 'Stabil',
                    ],
                    [
                        'item_id' => $processTextItem->id,
                        'value_text' => 'jernih',
                    ],
                ],
            ],
            'batch' => [
                [
                    'batch_no' => 1,
                    'values' => [
                        [
                            'item_id' => $batchNumberItem->id,
                            'value_number' => 2.5000,
                        ],
                        [
                            'item_id' => $batchTextItem->id,
                            'value_text' => 'biru muda',
                        ],
                    ],
                ],
            ],
        ];

        $createResponse = $this->postJson('/api/ipal/logs?userid=operator.01', $payload);
        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.process_log.status', 'DRAFT');

        $logId = $createResponse->json('data.id');

        $submitResponse = $this->postJson("/api/ipal/logs/{$logId}/submit?userid=operator.01");
        $submitResponse
            ->assertOk()
            ->assertJsonPath('data.status', 'SUBMITTED');

        $approveResponse = $this->postJson("/api/ipal/logs/{$logId}/approve?userid=supervisor.01");
        $approveResponse
            ->assertOk()
            ->assertJsonPath('data.status', 'APPROVED');

        $this->assertDatabaseHas('ipal_process_logs', [
            'log_id' => $logId,
            'status' => 'APPROVED',
        ]);

        $this->assertDatabaseHas('ipal_process_approvals', [
            'process_log_id' => DB::table('ipal_process_logs')->where('log_id', $logId)->value('id'),
            'operator_id' => $operator->id,
            'supervisor_id' => $supervisor->id,
        ]);
    }
}
