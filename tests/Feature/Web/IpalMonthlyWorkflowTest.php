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
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Inertia;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class IpalMonthlyWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_render_monthly_listing_detail_approve_and_lock_checklist(): void
    {
        Inertia::disableSsr();
        Carbon::setTestNow('2026-06-30 10:00:00');

        [$operatorA, $operatorB, $hseHead] = $this->createUsers();
        [$checklistTemplate, $checklistItem, $processTemplate, $processItem, $batchItem] = $this->createMasterData();

        $this->post('/dashboard/forms/catatan-pengolahan-limbah-air/checklist?user_id=operator.monthly.a', [
            'tanggal' => '2026-06-03',
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
        ])->assertRedirect('/dashboard/forms/catatan-pengolahan-limbah-air/create?user_id=operator.monthly.a&tanggal=2026-06-03');

        $this->post('/dashboard/forms/catatan-pengolahan-limbah-air/checklist?user_id=operator.monthly.b', [
            'tanggal' => '2026-06-03',
            'checklist' => [
                'template_id' => $checklistTemplate->id,
                'values' => [
                    [
                        'item_id' => $checklistItem->id,
                        'status' => 'NOT_OK',
                        'note' => 'Perlu pengecekan',
                    ],
                ],
            ],
        ])->assertRedirect('/dashboard/forms/catatan-pengolahan-limbah-air/create?user_id=operator.monthly.b&tanggal=2026-06-03');

        $this->post('/dashboard/forms/catatan-pengolahan-limbah-air/process?user_id=operator.monthly.a', [
            'tanggal' => '2026-06-03',
            'action' => 'SUBMIT',
            'has_mixing' => true,
            'process' => [
                'template_id' => $processTemplate->id,
                'values' => [
                    [
                        'item_id' => $processItem->id,
                        'value_number' => 7.1,
                    ],
                ],
            ],
            'batch' => [
                [
                    'batch_no' => 1,
                    'values' => [
                        [
                            'item_id' => $batchItem->id,
                            'value_number' => 2.5,
                        ],
                    ],
                ],
            ],
        ])->assertRedirect('/dashboard/forms/catatan-pengolahan-limbah-air/create?user_id=operator.monthly.a&tanggal=2026-06-03');

        $listingResponse = $this->get('/dashboard/forms/catatan-pengolahan-limbah-air?user_id=operator.monthly.a&year=2026');
        $listingResponse->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard/forms/catatan-pengolahan-limbah-air/index')
                ->has('listing.table.data')
                ->where('listing.filters.year', 2026)
                ->etc()
            );

        $juneListingRow = collect($listingResponse->inertiaProps('listing.table.data'))
            ->firstWhere('month', 6);

        $this->assertSame(1, $juneListingRow['checklist_days_count']);
        $this->assertSame(2, $juneListingRow['process_logs_count']);
        $this->assertSame(1, $juneListingRow['batch_mixing_days_count']);

        $detailResponse = $this->get('/dashboard/forms/catatan-pengolahan-limbah-air/monthly/2026/6?user_id=operator.monthly.a');
        $detailResponse->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard/forms/catatan-pengolahan-limbah-air/monthly')
                ->where('monthlyDetail.period.month', 6)
                ->where('monthlyDetail.period.year', 2026)
                ->where('monthlyDetail.summary.checklist_days_count', 1)
                ->where('monthlyDetail.summary.process_logs_count', 2)
                ->where('monthlyDetail.summary.batch_mixing_logs_count', 1)
                ->etc()
            );

        $monthlyDetail = $detailResponse->inertiaProps('monthlyDetail');
        $checklistCell = collect($monthlyDetail['checklist_matrix'][0]['cells'])
            ->firstWhere('date', '2026-06-03');

        $this->assertSame('NOT_OK', $checklistCell['status']);
        $this->assertSame('Tidak Berfungsi', $checklistCell['status_label']);
        $this->assertContains('Operator A', $checklistCell['operators']);
        $this->assertContains('Operator B', $checklistCell['operators']);

        $operatorProcessRow = collect($monthlyDetail['process_rows'])
            ->first(fn (array $row): bool => $row['operator']['external_id'] === 'operator.monthly.a');

        $this->assertSame('SUBMITTED', $operatorProcessRow['status']);
        $this->assertTrue($operatorProcessRow['has_batch_mixing']);
        $this->assertSame(1, $operatorProcessRow['batch_count']);

        $logId = IpalDailyLog::query()
            ->whereDate('tanggal', '2026-06-03')
            ->where('operator_id', $operatorA->id)
            ->value('id');

        $this->assertNotNull($logId);

        $this->get("/dashboard/forms/catatan-pengolahan-limbah-air/logs/{$logId}?user_id=operator.monthly.a")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard/forms/catatan-pengolahan-limbah-air/show')
                ->where('entryForm.module.subtitle', 'Detail read-only catatan proses dan batch mixing harian.')
                ->where('entryForm.entry.read_only', true)
                ->etc()
            );

        $this->post('/dashboard/forms/catatan-pengolahan-limbah-air/monthly/2026/6/checklist-approval?user_id=hse.head')
            ->assertRedirect('/dashboard/forms/catatan-pengolahan-limbah-air/monthly/2026/6?user_id=hse.head');

        $this->assertDatabaseHas('ipal_checklist_approvals', [
            'month' => 6,
            'year' => 2026,
            'supervisor_id' => $hseHead->id,
        ]);

        $this->post('/dashboard/forms/catatan-pengolahan-limbah-air/checklist?user_id=operator.monthly.b', [
            'tanggal' => '2026-06-04',
            'checklist' => [
                'template_id' => $checklistTemplate->id,
                'values' => [
                    [
                        'item_id' => $checklistItem->id,
                        'status' => 'OK',
                        'note' => null,
                    ],
                ],
            ],
        ])->assertSessionHasErrors(['tanggal']);
    }

    public function test_monthly_process_approval_is_limited_to_last_working_day_and_can_be_reopened_by_superadmin(): void
    {
        Inertia::disableSsr();
        Carbon::setTestNow('2026-06-29 10:00:00');

        [$operatorA, , $hseHead] = $this->createUsers();
        [, , $processTemplate] = $this->createMasterData();
        $superadmin = $this->createSuperadminWithMonthlyReopenPermission();
        $dailyLog = $this->createSubmittedProcessLog($operatorA, $processTemplate, '2026-06-03');

        $listingResponse = $this->get('/dashboard/forms/catatan-pengolahan-limbah-air?user_id=hse.head&year=2026');

        $listingResponse->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('listing.capabilities.can_approve_process_monthly', true)
                ->where('listing.capabilities.can_reopen_process_monthly', false)
                ->etc()
            );

        $juneListingRow = collect($listingResponse->inertiaProps('listing.table.data'))
            ->firstWhere('month', 6);

        $this->assertFalse($juneListingRow['can_approve_period']);

        $this->post('/dashboard/forms/catatan-pengolahan-limbah-air/monthly/2026/6/process-approval?user_id=hse.head')
            ->assertSessionHasErrors(['period']);

        Carbon::setTestNow('2026-06-30 10:00:00');

        $this->post('/dashboard/forms/catatan-pengolahan-limbah-air/monthly/2026/6/process-approval?user_id=hse.head')
            ->assertRedirect('/dashboard/forms/catatan-pengolahan-limbah-air?user_id=hse.head&year=2026');

        $this->assertDatabaseHas('ipal_process_logs', [
            'id' => $dailyLog->processLog->id,
            'status' => 'APPROVED',
        ]);
        $this->assertDatabaseHas('ipal_process_approvals', [
            'process_log_id' => $dailyLog->processLog->id,
            'supervisor_id' => $hseHead->id,
        ]);

        $this->get('/dashboard/forms/catatan-pengolahan-limbah-air?user_id=superadmin&year=2026')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('listing.capabilities.can_reopen_process_monthly', true)
                ->etc()
            );

        $this->post('/dashboard/forms/catatan-pengolahan-limbah-air/monthly/2026/6/process-approval/reopen?user_id=hse.head')
            ->assertForbidden();

        $this->post('/dashboard/forms/catatan-pengolahan-limbah-air/monthly/2026/6/process-approval/reopen?user_id=superadmin')
            ->assertRedirect('/dashboard/forms/catatan-pengolahan-limbah-air?user_id=superadmin&year=2026');

        $this->assertDatabaseHas('ipal_process_logs', [
            'id' => $dailyLog->processLog->id,
            'status' => 'SUBMITTED',
        ]);
        $this->assertDatabaseHas('ipal_process_approvals', [
            'process_log_id' => $dailyLog->processLog->id,
            'operator_id' => $operatorA->id,
            'supervisor_id' => null,
            'supervisor_signed_at' => null,
        ]);

        $this->assertTrue($superadmin->can('ipal.logs.reopen-monthly'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    /**
     * @return array{0: User, 1: User, 2: User}
     */
    private function createUsers(): array
    {
        $operatorA = User::factory()->create([
            'external_id' => 'operator.monthly.a',
            'name' => 'Operator A',
            'is_active' => true,
        ]);
        $operatorB = User::factory()->create([
            'external_id' => 'operator.monthly.b',
            'name' => 'Operator B',
            'is_active' => true,
        ]);
        $hseHead = User::factory()->create([
            'external_id' => 'hse.head',
            'name' => 'HSE Head',
            'is_active' => true,
        ]);

        Permission::query()->create([
            'name' => 'ipal.logs.approve',
            'guard_name' => 'web',
        ]);
        $hseHead->givePermissionTo('ipal.logs.approve');

        return [$operatorA, $operatorB, $hseHead];
    }

    private function createSuperadminWithMonthlyReopenPermission(): User
    {
        $superadmin = User::factory()->create([
            'external_id' => 'superadmin',
            'name' => 'Superadmin',
            'is_active' => true,
        ]);

        Permission::query()->firstOrCreate([
            'name' => 'ipal.logs.reopen-monthly',
            'guard_name' => 'web',
        ]);
        $superadmin->givePermissionTo('ipal.logs.reopen-monthly');

        return $superadmin;
    }

    private function createSubmittedProcessLog(User $operator, ProcessTemplate $processTemplate, string $date): IpalDailyLog
    {
        $dailyLog = IpalDailyLog::query()->create([
            'tanggal' => $date,
            'operator_id' => $operator->id,
            'day_type' => 'REGULAR',
            'is_operational' => true,
        ]);

        $processLog = $dailyLog->processLog()->create([
            'template_id' => $processTemplate->id,
            'status' => 'SUBMITTED',
            'submitted_at' => now(),
        ]);

        $processLog->approval()->create([
            'operator_id' => $operator->id,
            'operator_signed_at' => now(),
        ]);

        return $dailyLog->fresh(['processLog.approval']) ?? $dailyLog;
    }

    /**
     * @return array{0: ChecklistTemplate, 1: ChecklistItem, 2: ProcessTemplate, 3: ProcessItem, 4: BatchItem}
     */
    private function createMasterData(): array
    {
        $checklistTemplate = ChecklistTemplate::query()->create([
            'name' => 'Checklist Monthly',
            'is_active' => true,
        ]);
        $checklistItem = ChecklistItem::query()->create([
            'template_id' => $checklistTemplate->id,
            'name' => 'Water meter inlet',
            'category' => null,
            'standard_condition' => 'Berfungsi, tidak tersumbat',
            'order_no' => 1,
            'is_active' => true,
        ]);

        $processTemplate = ProcessTemplate::query()->create([
            'name' => 'Process Monthly',
            'is_active' => true,
        ]);
        $processSection = ProcessSection::query()->create([
            'template_id' => $processTemplate->id,
            'name' => 'Penampungan Awal',
            'order_no' => 1,
        ]);
        $processItem = ProcessItem::query()->create([
            'section_id' => $processSection->id,
            'name' => 'pH',
            'standard_condition' => '6 - 9',
            'input_type' => 'number',
            'order_no' => 1,
        ]);
        $batchItem = BatchItem::query()->create([
            'name' => 'Jumlah Chemical',
            'input_type' => 'number',
            'order_no' => 1,
        ]);

        return [$checklistTemplate, $checklistItem, $processTemplate, $processItem, $batchItem];
    }
}
