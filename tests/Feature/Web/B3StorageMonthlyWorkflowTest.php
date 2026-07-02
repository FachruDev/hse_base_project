<?php

namespace Tests\Feature\Web;

use App\Models\B3Storage\B3StorageInitiatorDepartment;
use App\Models\B3Storage\B3StorageLog;
use App\Models\B3Storage\B3StorageWasteType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\LaravelPdf\Facades\Pdf;
use Spatie\LaravelPdf\PdfBuilder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class B3StorageMonthlyWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_render_monthly_listing_detail_and_approve_b3_report(): void
    {
        Inertia::disableSsr();
        Storage::fake('public');
        Carbon::setTestNow('2026-07-02 10:00:00');

        [$operatorA, $operatorB, $environmentSupervisor, $hseDepartmentHead] = $this->createUsers();
        [$solidWasteType, $liquidWasteType, $qcDepartment, $qaDepartment] = $this->createMasterData();
        $initiatorUser = User::factory()->create([
            'external_id' => 'qc.initiator',
            'name' => 'QC Initiator',
            'email' => 'qc.initiator@example.test',
            'is_active' => true,
        ]);

        $this->get('/dashboard/forms/penyimpanan-limbah-b3/create?user_id=operator.b3.a')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('entryForm.entry.operator.email', $operatorA->email)
                ->has('entryForm.options.initiator_users')
                ->etc()
            );

        $this->post('/dashboard/forms/penyimpanan-limbah-b3?user_id=operator.b3.a', [
            'movement_date' => '2026-06-03',
            'movement_time' => '08:30',
            'movement_type' => 'MASUK',
            'waste_type_id' => $solidWasteType->id,
            'initiator_department_id' => $qcDepartment->id,
            'weight_kg' => 10.52,
            'document_number' => '01/QC/VI/26',
            'photo' => UploadedFile::fake()->image('bukti-a.jpg'),
            'note' => 'Masuk TPS',
        ])->assertRedirect();

        $this->assertDatabaseHas('b3_storage_logs', [
            'document_number' => '01/QC/VI/26',
            'operator_id' => $operatorA->id,
            'initiator_user_id' => $operatorA->id,
        ]);

        $this->post('/dashboard/forms/penyimpanan-limbah-b3?user_id=operator.b3.b', [
            'movement_date' => '2026-06-20',
            'movement_time' => '10:15',
            'movement_type' => 'KELUAR',
            'waste_type_id' => $liquidWasteType->id,
            'initiator_department_id' => $qaDepartment->id,
            'weight_kg' => 4.52,
            'document_number' => '02/QA/VI/26',
            'photo' => UploadedFile::fake()->image('bukti-b.jpg'),
            'note' => 'Keluar TPS',
            'initiator_user_external_id' => 'qc.initiator',
        ])->assertRedirect();

        $this->assertDatabaseHas('b3_storage_logs', [
            'document_number' => '02/QA/VI/26',
            'operator_id' => $operatorB->id,
            'initiator_user_id' => $initiatorUser->id,
        ]);

        $this->post('/dashboard/forms/penyimpanan-limbah-b3?user_id=operator.b3.a', [
            'movement_date' => '2026-06-21',
            'movement_time' => '11:10',
            'movement_type' => 'MASUK',
            'waste_type_id' => $solidWasteType->id,
            'initiator_department_id' => $qcDepartment->id,
            'weight_kg' => 2.1,
            'document_number' => 'INVALID/USER/VI/26',
            'initiator_user_external_id' => 'missing.user',
        ])->assertSessionHasErrors(['initiator_user_external_id']);

        $this->post('/dashboard/forms/penyimpanan-limbah-b3?user_id=operator.b3.a', [
            'movement_date' => '2026-07-02',
            'movement_time' => '09:00',
            'movement_type' => 'MASUK',
            'waste_type_id' => $solidWasteType->id,
            'initiator_department_id' => $qcDepartment->id,
            'weight_kg' => 3.25,
            'document_number' => '03/QC/VII/26',
            'photo' => UploadedFile::fake()->image('bukti-c.jpg'),
            'note' => 'Masuk periode berjalan',
        ])->assertRedirect();

        $listingResponse = $this->get('/dashboard/forms/penyimpanan-limbah-b3?user_id=operator.b3.a&year=2026');
        $listingResponse->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard/forms/penyimpanan-limbah-b3/index')
                ->where('listing.filters.year', 2026)
                ->has('listing.table.data')
                ->etc()
            );

        $this->assertNull(collect($listingResponse->inertiaProps('listing.table.data'))->firstWhere('month', 5));

        $juneListingRow = collect($listingResponse->inertiaProps('listing.table.data'))
            ->firstWhere('month', 6);

        $this->assertSame(2, $juneListingRow['total_logs_count']);
        $this->assertSame(1, $juneListingRow['incoming_logs_count']);
        $this->assertSame(1, $juneListingRow['outgoing_logs_count']);
        $this->assertSame(15.04, (float) $juneListingRow['total_weight_kg']);

        $julyListingRow = collect($listingResponse->inertiaProps('listing.table.data'))
            ->firstWhere('month', 7);

        $this->assertFalse($julyListingRow['can_approve_period']);
        $this->assertFalse($julyListingRow['can_approve_monthly']);
        $this->assertSame('Belum masuk periode approval', $julyListingRow['approval_blocked_label']);

        $julyDetailResponse = $this->get('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/7?user_id=env.spv');
        $julyDetailResponse->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('monthlyDetail.capabilities.can_approve_period', false)
                ->where('monthlyDetail.capabilities.approve_monthly', false)
                ->where('monthlyDetail.capabilities.approval_blocked_reason', 'Belum masuk periode approval.')
                ->etc()
            );

        $this->post('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/7/approval?user_id=env.spv', [
            'approval_role' => 'ENVIRONMENT_SUPERVISOR',
        ])->assertSessionHasErrors(['period']);

        $filteredListingResponse = $this->get('/dashboard/forms/penyimpanan-limbah-b3?user_id=operator.b3.a&year=2026&date_from=2026-06-16&date_to=2026-08-16');
        $filteredJuneListingRow = collect($filteredListingResponse->inertiaProps('listing.table.data'))
            ->firstWhere('month', 6);

        $this->assertSame(1, $filteredJuneListingRow['total_logs_count']);
        $this->assertSame(4.52, (float) $filteredJuneListingRow['total_weight_kg']);

        $detailResponse = $this->get('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/6?user_id=operator.b3.a&date_from=2026-06-16&date_to=2026-08-16');
        $detailResponse->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard/forms/penyimpanan-limbah-b3/monthly')
                ->where('monthlyDetail.period.month', 6)
                ->where('monthlyDetail.period.year', 2026)
                ->where('monthlyDetail.period.date_from', '2026-06-16')
                ->where('monthlyDetail.period.date_to', '2026-06-30')
                ->where('monthlyDetail.summary.total_logs_count', 1)
                ->where('monthlyDetail.summary.incoming_logs_count', 0)
                ->where('monthlyDetail.summary.outgoing_logs_count', 1)
                ->where('monthlyDetail.approval.status', 'NOT_SUBMITTED')
                ->etc()
            );

        $monthlyDetail = $detailResponse->inertiaProps('monthlyDetail');

        $this->assertCount(1, $monthlyDetail['rows']);
        $this->assertSame('02/QA/VI/26', $monthlyDetail['rows'][0]['document_number']);
        $this->assertSame('KELUAR', $monthlyDetail['rows'][0]['movement_type']);
        $this->assertSame('2026-06-20', $monthlyDetail['rows'][0]['movement_date']);
        $this->assertSame('Produk/Bahan Awal Cair', $monthlyDetail['rows'][0]['waste_type_name']);
        $this->assertSame(4.52, (float) $monthlyDetail['rows'][0]['weight_kg']);
        $this->assertIsString($monthlyDetail['rows'][0]['created_at']);
        $this->assertSame(4.52, (float) $monthlyDetail['totals']['overall']);
        $this->assertSame(0.0, (float) $monthlyDetail['totals']['by_waste_type'][$solidWasteType->id]);
        $this->assertSame(4.52, (float) $monthlyDetail['totals']['by_waste_type'][$liquidWasteType->id]);

        $this->get('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/6/excel?user_id=operator.b3.a&date_from=2026-06-16&date_to=2026-08-16')
            ->assertOk()
            ->assertDownload('penyimpanan-limbah-b3-2026-6.xlsx');

        Pdf::fake();

        $this->get('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/6/pdf?user_id=operator.b3.a&date_from=2026-06-16&date_to=2026-08-16')
            ->assertOk();

        Pdf::assertRespondedWithPdf(fn (PdfBuilder $pdf): bool => $pdf->viewName === 'pdf.b3-storage.monthly-detail'
            && $pdf->downloadName === 'penyimpanan-limbah-b3-2026-6.pdf'
            && $pdf->orientation === 'Landscape'
            && ($pdf->viewData['monthlyDetail']['period']['date_from'] ?? null) === '2026-06-16'
            && count($pdf->viewData['monthlyDetail']['rows'] ?? []) === 1);

        $operatorBLogId = B3StorageLog::query()
            ->where('document_number', '02/QA/VI/26')
            ->value('id');

        $this->assertNotNull($operatorBLogId);
        $this->get("/dashboard/forms/penyimpanan-limbah-b3/{$operatorBLogId}/photo?user_id=operator.b3.a")
            ->assertOk();

        Pdf::fake();

        $this->get("/dashboard/forms/penyimpanan-limbah-b3/{$operatorBLogId}/pdf?user_id=operator.b3.a")
            ->assertOk();

        Pdf::assertRespondedWithPdf(fn (PdfBuilder $pdf): bool => $pdf->viewName === 'pdf.b3-storage.log-detail'
            && $pdf->downloadName === "penyimpanan-limbah-b3-log-{$operatorBLogId}.pdf"
            && ($pdf->viewData['log']['document_number'] ?? null) === '02/QA/VI/26'
            && ($pdf->viewData['log']['waste_type_name'] ?? null) === 'Produk/Bahan Awal Cair');

        $this->post('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/6/approval?user_id=hse.head', [
            'approval_role' => 'ENVIRONMENT_SUPERVISOR',
        ])->assertSessionHasErrors(['approval_role']);

        $this->post('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/6/approval?user_id=hse.head', [
            'approval_role' => 'HSE_DEPARTMENT_HEAD',
        ])->assertSessionHasErrors(['approval_role']);

        $this->post('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/6/approval?user_id=env.spv', [
            'approval_role' => 'ENVIRONMENT_SUPERVISOR',
        ])->assertRedirect('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/6?user_id=env.spv');

        $this->post('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/6/approval?user_id=env.spv', [
            'approval_role' => 'ENVIRONMENT_SUPERVISOR',
        ])->assertSessionHasErrors(['approval_role']);

        $this->assertDatabaseHas('b3_storage_monthly_approvals', [
            'month' => 6,
            'year' => 2026,
            'environment_supervisor_id' => $environmentSupervisor->id,
        ]);

        $this->post('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/6/approval?user_id=hse.head', [
            'approval_role' => 'HSE_DEPARTMENT_HEAD',
        ])->assertRedirect('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/6?user_id=hse.head');

        $this->post('/dashboard/forms/penyimpanan-limbah-b3/monthly/2026/6/approval?user_id=hse.head', [
            'approval_role' => 'HSE_DEPARTMENT_HEAD',
        ])->assertSessionHasErrors(['approval_role']);

        $this->assertDatabaseHas('b3_storage_monthly_approvals', [
            'month' => 6,
            'year' => 2026,
            'environment_supervisor_id' => $environmentSupervisor->id,
            'hse_department_head_id' => $hseDepartmentHead->id,
        ]);

    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
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

        Role::query()->create([
            'name' => 'supervisor',
            'guard_name' => 'web',
        ]);
        Role::query()->create([
            'name' => 'hse_dept_head',
            'guard_name' => 'web',
        ]);

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
        $environmentSupervisor->assignRole('supervisor');
        $hseDepartmentHead->givePermissionTo([
            'b3storage.logs.view',
            'b3storage.monthly-report.view',
            'b3storage.monthly-approval.approve',
        ]);
        $hseDepartmentHead->assignRole('hse_dept_head');

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
