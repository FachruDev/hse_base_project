<?php

namespace Tests\Feature\Web;

use App\Models\B3Storage\B3StorageInitiatorDepartment;
use App\Models\B3Storage\B3StorageLog;
use App\Models\B3Storage\B3StorageWasteType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class B3StorageMonthlyWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_render_monthly_listing_detail_and_approve_b3_report(): void
    {
        Inertia::disableSsr();
        Storage::fake('public');

        [$operatorA, $operatorB, $environmentSupervisor, $hseDepartmentHead] = $this->createUsers();
        [$solidWasteType, $liquidWasteType, $qcDepartment, $qaDepartment] = $this->createMasterData();

        $this->post('/dashboard/forms/penyimpanan-limbah-b3?user_id=operator.b3.a', [
            'movement_date' => '2026-04-03',
            'movement_time' => '08:30',
            'movement_type' => 'MASUK',
            'waste_type_id' => $solidWasteType->id,
            'initiator_department_id' => $qcDepartment->id,
            'weight_kg' => 10.5,
            'document_number' => '01/QC/IV/26',
            'photo' => UploadedFile::fake()->image('bukti-a.jpg'),
            'note' => 'Masuk TPS',
        ])->assertRedirect();

        $this->post('/dashboard/forms/penyimpanan-limbah-b3?user_id=operator.b3.b', [
            'movement_date' => '2026-04-04',
            'movement_time' => '10:15',
            'movement_type' => 'KELUAR',
            'waste_type_id' => $liquidWasteType->id,
            'initiator_department_id' => $qaDepartment->id,
            'weight_kg' => 4.5,
            'document_number' => '02/QA/IV/26',
            'photo' => UploadedFile::fake()->image('bukti-b.jpg'),
            'note' => 'Keluar TPS',
        ])->assertRedirect();

        $listingResponse = $this->get('/dashboard/forms/penyimpanan-limbah-b3?user_id=operator.b3.a&year=2026');
        $listingResponse->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard/forms/penyimpanan-limbah-b3/index')
                ->where('listing.filters.year', 2026)
                ->has('listing.table.data')
                ->etc()
            );

        $aprilListingRow = collect($listingResponse->inertiaProps('listing.table.data'))
            ->firstWhere('month', 4);

        $this->assertSame(2, $aprilListingRow['total_logs_count']);
        $this->assertSame(1, $aprilListingRow['incoming_logs_count']);
        $this->assertSame(1, $aprilListingRow['outgoing_logs_count']);
        $this->assertSame(15.0, (float) $aprilListingRow['total_weight_kg']);

        $detailResponse = $this->get('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/4?user_id=operator.b3.a');
        $detailResponse->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard/forms/penyimpanan-limbah-b3/monthly')
                ->where('monthlyDetail.period.month', 4)
                ->where('monthlyDetail.period.year', 2026)
                ->where('monthlyDetail.summary.total_logs_count', 2)
                ->where('monthlyDetail.summary.incoming_logs_count', 1)
                ->where('monthlyDetail.summary.outgoing_logs_count', 1)
                ->where('monthlyDetail.approval.status', 'NOT_SUBMITTED')
                ->etc()
            );

        $monthlyDetail = $detailResponse->inertiaProps('monthlyDetail');

        $this->assertCount(2, $monthlyDetail['rows']);
        $this->assertSame('01/QC/IV/26', $monthlyDetail['rows'][0]['document_number']);
        $this->assertSame('02/QA/IV/26', $monthlyDetail['rows'][1]['document_number']);
        $this->assertSame(15.0, (float) $monthlyDetail['totals']['overall']);
        $this->assertSame(10.5, (float) $monthlyDetail['totals']['by_waste_type'][$solidWasteType->id]);
        $this->assertSame(4.5, (float) $monthlyDetail['totals']['by_waste_type'][$liquidWasteType->id]);

        $operatorBLogId = B3StorageLog::query()
            ->where('document_number', '02/QA/IV/26')
            ->value('id');

        $this->assertNotNull($operatorBLogId);
        $this->get("/dashboard/forms/penyimpanan-limbah-b3/{$operatorBLogId}/photo?user_id=operator.b3.a")
            ->assertOk();

        $this->post('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/4/approval?user_id=hse.head', [
            'approval_role' => 'HSE_DEPARTMENT_HEAD',
        ])->assertSessionHasErrors(['approval_role']);

        $this->post('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/4/approval?user_id=env.spv', [
            'approval_role' => 'ENVIRONMENT_SUPERVISOR',
        ])->assertRedirect('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/4?user_id=env.spv');

        $this->assertDatabaseHas('b3_storage_monthly_approvals', [
            'month' => 4,
            'year' => 2026,
            'environment_supervisor_id' => $environmentSupervisor->id,
        ]);

        $this->post('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/4/approval?user_id=hse.head', [
            'approval_role' => 'HSE_DEPARTMENT_HEAD',
        ])->assertRedirect('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/4?user_id=hse.head');

        $this->assertDatabaseHas('b3_storage_monthly_approvals', [
            'month' => 4,
            'year' => 2026,
            'environment_supervisor_id' => $environmentSupervisor->id,
            'hse_department_head_id' => $hseDepartmentHead->id,
        ]);
    }

    /**
     * @return array{0: User, 1: User, 2: User, 3: User}
     */
    private function createUsers(): array
    {
        $permissions = [
            'b3storage.logs.create',
            'b3storage.logs.view',
            'b3storage.monthly-report.view',
            'b3storage.monthly-approval.approve',
        ];

        foreach ($permissions as $permission) {
            Permission::query()->create([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        $operatorA = User::factory()->create([
            'external_id' => 'operator.b3.a',
            'name' => 'Operator B3 A',
            'is_active' => true,
        ]);
        $operatorB = User::factory()->create([
            'external_id' => 'operator.b3.b',
            'name' => 'Operator B3 B',
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

        $operatorA->givePermissionTo([
            'b3storage.logs.create',
            'b3storage.logs.view',
            'b3storage.monthly-report.view',
        ]);
        $operatorB->givePermissionTo([
            'b3storage.logs.create',
            'b3storage.logs.view',
            'b3storage.monthly-report.view',
        ]);
        $environmentSupervisor->givePermissionTo([
            'b3storage.logs.view',
            'b3storage.monthly-report.view',
            'b3storage.monthly-approval.approve',
        ]);
        $hseDepartmentHead->givePermissionTo([
            'b3storage.logs.view',
            'b3storage.monthly-report.view',
            'b3storage.monthly-approval.approve',
        ]);

        return [$operatorA, $operatorB, $environmentSupervisor, $hseDepartmentHead];
    }

    /**
     * @return array{0: B3StorageWasteType, 1: B3StorageWasteType, 2: B3StorageInitiatorDepartment, 3: B3StorageInitiatorDepartment}
     */
    private function createMasterData(): array
    {
        $solidWasteType = B3StorageWasteType::query()->create([
            'name' => 'Produk/Bahan Awal Padat',
            'order_no' => 1,
            'is_active' => true,
        ]);
        $liquidWasteType = B3StorageWasteType::query()->create([
            'name' => 'Produk/Bahan Awal Cair',
            'order_no' => 2,
            'is_active' => true,
        ]);
        $qcDepartment = B3StorageInitiatorDepartment::query()->create([
            'name' => 'QC',
            'order_no' => 1,
            'is_active' => true,
        ]);
        $qaDepartment = B3StorageInitiatorDepartment::query()->create([
            'name' => 'QA',
            'order_no' => 2,
            'is_active' => true,
        ]);

        return [$solidWasteType, $liquidWasteType, $qcDepartment, $qaDepartment];
    }
}
