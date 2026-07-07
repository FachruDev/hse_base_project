<?php

namespace Tests\Feature\Api;

use App\Models\Master\ChecklistItem;
use App\Models\Master\ChecklistTemplate;
use App\Models\Master\Holiday;
use App\Models\Master\OperationalWeekday;
use App\Models\Master\ProcessTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class OperationalCalendarWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_crud_holiday_master_data(): void
    {
        User::factory()->create([
            'external_id' => 'admin.01',
            'is_active' => true,
        ]);

        $createResponse = $this->postJson('/api/master/holidays?userid=admin.01', [
            'holiday_date' => '2026-08-17',
            'name' => 'Hari Kemerdekaan',
            'description' => 'Libur nasional',
            'is_active' => true,
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.name', 'Hari Kemerdekaan');

        $holidayId = $createResponse->json('data.id');

        $updateResponse = $this->patchJson("/api/master/holidays/{$holidayId}?userid=admin.01", [
            'holiday_date' => '2026-08-17',
            'name' => 'Hari Kemerdekaan RI',
            'description' => 'Libur nasional',
            'is_active' => true,
        ]);

        $updateResponse
            ->assertOk()
            ->assertJsonPath('data.name', 'Hari Kemerdekaan RI');

        $this->getJson('/api/master/holidays?userid=admin.01')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Hari Kemerdekaan RI');

        $this->deleteJson("/api/master/holidays/{$holidayId}?userid=admin.01")
            ->assertOk();

        $this->assertDatabaseMissing('m_holidays', [
            'id' => $holidayId,
        ]);
    }

    public function test_non_operational_day_auto_generates_na_checklist_values(): void
    {
        $operator = User::factory()->create([
            'external_id' => 'operator.02',
            'is_active' => true,
        ]);

        Permission::query()->create(['name' => 'ipal.logs.create', 'guard_name' => 'web']);
        $operator->givePermissionTo('ipal.logs.create');

        $checklistTemplate = ChecklistTemplate::query()->create([
            'name' => 'Checklist Harian',
            'is_active' => true,
        ]);

        ChecklistItem::query()->create([
            'template_id' => $checklistTemplate->id,
            'name' => 'Water meter inlet',
            'order_no' => 1,
            'is_active' => true,
        ]);

        ProcessTemplate::query()->create([
            'name' => 'Proses Harian',
            'is_active' => true,
        ]);

        $holidayDate = '2026-12-25';
        Holiday::query()->create([
            'holiday_date' => $holidayDate,
            'name' => 'Libur Natal',
            'is_active' => true,
        ]);

        OperationalWeekday::query()->updateOrCreate(
            ['day_of_week_iso' => 5],
            ['day_name' => 'Jumat', 'is_off' => false],
        );

        $response = $this->postJson('/api/ipal/logs?userid=operator.02', [
            'tanggal' => $holidayDate,
            'action' => 'DRAFT',
            'checklist' => [
                'template_id' => $checklistTemplate->id,
            ],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.day_type', 'HOLIDAY')
            ->assertJsonPath('data.is_operational', false)
            ->assertJsonPath('data.checklist.values.0.status', 'NA');
    }
}
