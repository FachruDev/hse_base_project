<?php

namespace Tests\Feature\Api;

use App\Models\B3Storage\B3StorageInitiatorDepartment;
use App\Models\B3Storage\B3StorageWasteType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class B3StorageWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_run_b3_storage_workflow_from_master_to_monthly_approval(): void
    {
        Storage::fake('public');

        $operator = User::factory()->create([
            'external_id' => 'operator.b3',
            'name' => 'Operator B3',
            'is_active' => true,
        ]);

        $environmentSupervisor = User::factory()->create([
            'external_id' => 'env.spv',
            'name' => 'Environment SPV',
            'is_active' => true,
        ]);

        $hseDepartmentHead = User::factory()->create([
            'external_id' => 'hse.head',
            'name' => 'HSE Dept Head',
            'is_active' => true,
        ]);

        $wasteType = B3StorageWasteType::query()->create([
            'name' => 'Produk/Bahan Awal Padat',
            'order_no' => 1,
            'is_active' => true,
        ]);

        $department = B3StorageInitiatorDepartment::query()->create([
            'name' => 'QC',
            'order_no' => 1,
            'is_active' => true,
        ]);

        $createResponse = $this->post('/api/b3-storage/logs?userid=operator.b3', [
            'movement_date' => '2026-04-17',
            'movement_time' => '08:30',
            'movement_type' => 'MASUK',
            'waste_type_id' => $wasteType->id,
            'initiator_department_id' => $department->id,
            'weight_kg' => 19.5,
            'document_number' => '01/QC/IV/26',
            'photo' => UploadedFile::fake()->image('bukti.jpg'),
            'note' => 'Kondisi baik',
        ], [
            'Accept' => 'application/json',
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.movement_type', 'MASUK')
            ->assertJsonPath('data.waste_type_id', $wasteType->id);

        $logId = (int) $createResponse->json('data.id');
        $photoPath = $createResponse->json('data.photo_path');
        $this->assertNotNull($photoPath);
        Storage::disk('public')->assertExists($photoPath);

        $this->putJson("/api/b3-storage/logs/{$logId}?userid=operator.b3", [
            'movement_date' => '2026-04-18',
            'movement_time' => '10:15',
            'movement_type' => 'KELUAR',
            'waste_type_other' => 'Jenis limbah custom',
            'initiator_department_other' => 'Dept custom',
            'weight_kg' => 7.0,
            'document_number' => '02/CUSTOM/IV/26',
            'note' => 'Keluar gudang',
        ])->assertOk()
            ->assertJsonPath('data.movement_type', 'KELUAR')
            ->assertJsonPath('data.waste_type_id', null)
            ->assertJsonPath('data.waste_type_other', 'Jenis limbah custom');

        $this->getJson('/api/b3-storage/logs?userid=operator.b3&month=4&year=2026')
            ->assertOk()
            ->assertJsonPath('total', 1);

        $this->getJson('/api/b3-storage/monthly-report?userid=operator.b3&month=4&year=2026')
            ->assertOk()
            ->assertJsonPath('data.period.month', 4)
            ->assertJsonPath('data.period.year', 2026)
            ->assertJsonPath('data.approval.status', 'NOT_SUBMITTED');

        $this->postJson('/api/b3-storage/monthly-report/approve?userid=hse.head', [
            'month' => 4,
            'year' => 2026,
            'approval_role' => 'HSE_DEPARTMENT_HEAD',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['approval_role']);

        $this->postJson('/api/b3-storage/monthly-report/approve?userid=env.spv', [
            'month' => 4,
            'year' => 2026,
            'approval_role' => 'ENVIRONMENT_SUPERVISOR',
        ])->assertOk()
            ->assertJsonPath('data.environment_supervisor_id', $environmentSupervisor->id);

        $this->postJson('/api/b3-storage/monthly-report/approve?userid=hse.head', [
            'month' => 4,
            'year' => 2026,
            'approval_role' => 'HSE_DEPARTMENT_HEAD',
        ])->assertOk()
            ->assertJsonPath('data.hse_department_head_id', $hseDepartmentHead->id);

        $reportAfterApproval = $this->getJson('/api/b3-storage/monthly-report?userid=operator.b3&month=4&year=2026');
        $reportAfterApproval
            ->assertOk()
            ->assertJsonPath('data.approval.status', 'APPROVED');
    }

    public function test_can_manage_b3_storage_master_data_from_api(): void
    {
        User::factory()->create([
            'external_id' => 'admin.b3',
            'is_active' => true,
        ]);

        $wasteTypeResponse = $this->postJson('/api/b3-storage/master/waste-types?userid=admin.b3', [
            'name' => 'Lampu TL Bekas',
            'order_no' => 5,
            'is_active' => true,
        ]);

        $wasteTypeResponse->assertCreated();
        $wasteTypeId = (int) $wasteTypeResponse->json('data.id');

        $departmentResponse = $this->postJson('/api/b3-storage/master/initiator-departments?userid=admin.b3', [
            'name' => 'Engineering',
            'order_no' => 3,
            'is_active' => true,
        ]);

        $departmentResponse->assertCreated();
        $departmentId = (int) $departmentResponse->json('data.id');

        $this->putJson("/api/b3-storage/master/waste-types/{$wasteTypeId}?userid=admin.b3", [
            'name' => 'Lampu TL Bekas Update',
            'order_no' => 6,
            'is_active' => false,
        ])->assertOk()
            ->assertJsonPath('data.name', 'Lampu TL Bekas Update');

        $this->putJson("/api/b3-storage/master/initiator-departments/{$departmentId}?userid=admin.b3", [
            'name' => 'Engineering Update',
            'order_no' => 4,
            'is_active' => false,
        ])->assertOk()
            ->assertJsonPath('data.name', 'Engineering Update');

        $this->deleteJson("/api/b3-storage/master/waste-types/{$wasteTypeId}?userid=admin.b3")
            ->assertOk();

        $this->deleteJson("/api/b3-storage/master/initiator-departments/{$departmentId}?userid=admin.b3")
            ->assertOk();
    }
}
