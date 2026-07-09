<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\B3Storage\StoreB3StorageLogRequest;
use App\Http\Requests\Web\B3StorageLogIndexRequest;
use App\Http\Requests\Web\B3StorageMonthlyApprovalRequest;
use App\Http\Requests\Web\B3StorageMonthlyPeriodRequest;
use App\Http\Requests\Web\CatatanPengolahanLimbahAirIndexRequest;
use App\Http\Requests\Web\IpalDailyLogApproveRequest;
use App\Http\Requests\Web\IpalEntryDateRequest;
use App\Http\Requests\Web\IpalMonthlyPeriodRequest;
use App\Http\Requests\Web\IpalMonthlyProcessApprovalRequest;
use App\Http\Requests\Web\SaveIpalChecklistRequest;
use App\Http\Requests\Web\SaveIpalProcessRequest;
use App\Models\B3Storage\B3StorageLog;
use App\Models\Ipal\IpalChecklistValueAttachment;
use App\Models\Ipal\IpalDailyLog;
use App\Models\Ipal\IpalProcessValueAttachment;
use App\Models\User;
use App\Services\B3Storage\B3StorageService;
use App\Services\Ipal\IpalLogService;
use App\Services\Web\B3StoragePageService;
use App\Services\Web\CatatanPengolahanLimbahAirPageService;
use App\Services\Web\DashboardService;
use App\Support\Excel\SimpleXlsx;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\LaravelPdf\Facades\Pdf;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class DashboardController extends Controller
{
    public function index(Request $request, DashboardService $dashboardService): Response
    {
        return Inertia::render('dashboard/index', [
            'dashboard' => $dashboardService->build($request->user()),
        ]);
    }

    public function catatanPengolahanLimbahAirIndex(
        CatatanPengolahanLimbahAirIndexRequest $request,
        CatatanPengolahanLimbahAirPageService $pageService,
        IpalLogService $ipalLogService,
    ): Response {
        return Inertia::render('dashboard/forms/catatan-pengolahan-limbah-air/index', [
            'listing' => $pageService->buildListing($request->user(), $request->filters(), $ipalLogService),
        ]);
    }

    public function catatanPengolahanLimbahAirCreate(
        IpalEntryDateRequest $request,
        CatatanPengolahanLimbahAirPageService $pageService,
    ): Response {
        abort_unless($request->user()?->can('ipal.logs.create'), 403);

        return Inertia::render('dashboard/forms/catatan-pengolahan-limbah-air/create', [
            'entryForm' => $pageService->buildForm($this->authenticatedUser($request), $request->entryDate()),
        ]);
    }

    public function catatanPengolahanLimbahAirMonthlyShow(
        IpalMonthlyPeriodRequest $request,
        CatatanPengolahanLimbahAirPageService $pageService,
        IpalLogService $ipalLogService,
    ): Response {
        return Inertia::render('dashboard/forms/catatan-pengolahan-limbah-air/monthly', [
            'monthlyDetail' => $pageService->buildMonthlyDetail(
                $this->authenticatedUser($request),
                $request->year(),
                $request->month(),
                $ipalLogService,
            ),
        ]);
    }

    public function catatanPengolahanLimbahAirMonthlyChecklistPdf(
        IpalMonthlyPeriodRequest $request,
        CatatanPengolahanLimbahAirPageService $pageService,
        IpalLogService $ipalLogService,
    ): Responsable {
        $detail = $pageService->buildMonthlyPdfDetail(
            $this->authenticatedUser($request),
            $request->year(),
            $request->month(),
            $ipalLogService,
        );

        return Pdf::view('pdf.ipal.monthly-checklist', [
            'monthlyDetail' => $detail,
        ])
            ->landscape()
            ->format('a4')
            ->margins(8, 8, 10, 8)
            ->name("checklist-ipal-{$request->year()}-{$request->month()}.pdf");
    }

    public function catatanPengolahanLimbahAirMonthlyBatchMixingPdf(
        IpalMonthlyPeriodRequest $request,
        CatatanPengolahanLimbahAirPageService $pageService,
        IpalLogService $ipalLogService,
    ): Responsable {
        $detail = $pageService->buildMonthlyPdfDetail(
            $this->authenticatedUser($request),
            $request->year(),
            $request->month(),
            $ipalLogService,
        );

        return Pdf::view('pdf.ipal.monthly-batch-mixing', [
            'monthlyDetail' => $detail,
        ])
            ->landscape()
            ->format('a4')
            ->margins(8, 8, 10, 8)
            ->name("batch-mixing-ipal-{$request->year()}-{$request->month()}.pdf");
    }

    public function catatanPengolahanLimbahAirChecklistAttachment(
        Request $request,
        IpalChecklistValueAttachment $attachment,
    ): SymfonyResponse {
        $viewer = $this->authenticatedUser($request);
        $attachment->loadMissing('checklistValue.checklist.dailyLog');

        $log = $attachment->checklistValue?->checklist?->dailyLog;
        abort_unless($log instanceof IpalDailyLog && $this->canViewIpalAttachment($viewer, $log), 403);

        if (! Storage::disk('public')->exists($attachment->file_path)) {
            abort(404);
        }

        return Storage::disk('public')->response($attachment->file_path, $attachment->original_name);
    }

    public function catatanPengolahanLimbahAirProcessAttachment(
        Request $request,
        IpalProcessValueAttachment $attachment,
    ): SymfonyResponse {
        $viewer = $this->authenticatedUser($request);
        $attachment->loadMissing('processValue.processLog.dailyLog');

        $log = $attachment->processValue?->processLog?->dailyLog;
        abort_unless($log instanceof IpalDailyLog && $this->canViewIpalAttachment($viewer, $log), 403);

        if (! Storage::disk('public')->exists($attachment->file_path)) {
            abort(404);
        }

        return Storage::disk('public')->response($attachment->file_path, $attachment->original_name);
    }

    public function catatanPengolahanLimbahAirApproveMonthlyChecklist(
        IpalMonthlyPeriodRequest $request,
        IpalLogService $ipalLogService,
    ): RedirectResponse {
        abort_unless($request->user()?->can('ipal.logs.approve'), 403);

        $ipalLogService->approveMonthlyChecklist(
            $request->month(),
            $request->year(),
            $this->authenticatedUser($request),
        );

        return redirect()
            ->route('dashboard.forms.catatan-pengolahan-limbah-air.monthly.show', [
                'year' => $request->year(),
                'month' => $request->month(),
                'user_id' => $this->authenticatedUser($request)->external_id,
            ])
            ->with('success', 'Checklist bulanan berhasil di-approve oleh HSE Dept Head.');
    }

    public function catatanPengolahanLimbahAirLogShow(
        Request $request,
        IpalDailyLog $log,
        CatatanPengolahanLimbahAirPageService $pageService,
    ): Response {
        $viewer = $this->authenticatedUser($request);

        return Inertia::render('dashboard/forms/catatan-pengolahan-limbah-air/show', [
            'entryForm' => $pageService->buildDailyDetail($log, $viewer),
        ]);
    }

    public function catatanPengolahanLimbahAirDailyPdf(
        Request $request,
        IpalDailyLog $log,
        CatatanPengolahanLimbahAirPageService $pageService,
    ): Responsable {
        $viewer = $this->authenticatedUser($request);
        $detail = $pageService->buildDailyDetail($log, $viewer);
        $date = (string) ($detail['entry']['tanggal'] ?? $log->tanggal?->toDateString() ?? now()->toDateString());

        return Pdf::view('pdf.ipal.daily-detail', [
            'entryForm' => $detail,
        ])
            ->format('a4')
            ->margins(10, 10, 12, 10)
            ->name("catatan-ipal-harian-{$date}.pdf");
    }

    public function catatanPengolahanLimbahAirApproveDailyLog(
        IpalDailyLogApproveRequest $request,
        IpalDailyLog $log,
        IpalLogService $ipalLogService,
    ): RedirectResponse {
        abort_unless($request->user()?->can('ipal.logs.approve'), 403);
        $supervisor = $this->authenticatedUser($request);

        $ipalLogService->approve($log, $supervisor);

        return redirect()
            ->route('dashboard.forms.catatan-pengolahan-limbah-air.logs.show', [
                'log' => $log->id,
                'user_id' => $supervisor->external_id,
            ])
            ->with('success', 'Catatan proses harian berhasil diperiksa.');
    }

    public function catatanPengolahanLimbahAirReopenDailyLog(
        Request $request,
        IpalDailyLog $log,
        IpalLogService $ipalLogService,
    ): RedirectResponse {
        abort_unless($request->user()?->can('ipal.logs.reopen'), 403);
        $user = $this->authenticatedUser($request);

        $ipalLogService->reopen($log);

        return redirect()
            ->route('dashboard.forms.catatan-pengolahan-limbah-air.logs.show', [
                'log' => $log->id,
                'user_id' => $user->external_id,
            ])
            ->with('success', 'Log catatan proses berhasil di-reopen dan dapat diedit kembali.');
    }

    public function catatanPengolahanLimbahAirApproveMonthlyProcess(
        IpalMonthlyProcessApprovalRequest $request,
        IpalLogService $ipalLogService,
    ): RedirectResponse {
        abort_unless($request->user()?->can('ipal.logs.approve'), 403);
        $supervisor = $this->authenticatedUser($request);

        $count = $ipalLogService->approveMonthlyProcess(
            $request->month(),
            $request->year(),
            $supervisor,
        );

        return redirect()
            ->route('dashboard.forms.catatan-pengolahan-limbah-air.index', [
                'user_id' => $supervisor->external_id,
                'year' => $request->year(),
            ])
            ->with('success', "Approval bulanan catatan proses berhasil disimpan. {$count} catatan proses pending ikut di-approve.");
    }

    public function catatanPengolahanLimbahAirReopenMonthlyProcess(
        IpalMonthlyProcessApprovalRequest $request,
        IpalLogService $ipalLogService,
    ): RedirectResponse {
        abort_unless($request->user()?->can('ipal.logs.reopen-monthly'), 403);
        $superadmin = $this->authenticatedUser($request);

        $count = $ipalLogService->reopenMonthlyProcess(
            $request->month(),
            $request->year(),
        );

        return redirect()
            ->route('dashboard.forms.catatan-pengolahan-limbah-air.index', [
                'user_id' => $superadmin->external_id,
                'year' => $request->year(),
            ])
            ->with('success', "Berhasil membuka kembali {$count} approval catatan proses bulan ini.");
    }

    public function catatanPengolahanLimbahAirSaveChecklist(
        SaveIpalChecklistRequest $request,
        IpalLogService $ipalLogService,
    ): RedirectResponse {
        abort_unless($request->user()?->can('ipal.logs.create'), 403);

        $user = $this->authenticatedUser($request);
        $ipalLogService->upsertChecklist($request->validated(), $user);

        return redirect()
            ->route('dashboard.forms.catatan-pengolahan-limbah-air.create', [
                'user_id' => $user->external_id,
                'tanggal' => $request->validated()['tanggal'],
            ])
            ->with('success', 'Checklist harian berhasil disimpan.');
    }

    public function catatanPengolahanLimbahAirSaveProcess(
        SaveIpalProcessRequest $request,
        IpalLogService $ipalLogService,
    ): RedirectResponse {
        abort_unless($request->user()?->can('ipal.logs.create'), 403);

        $user = $this->authenticatedUser($request);
        $isSubmit = ($request->validated()['action'] ?? 'DRAFT') === 'SUBMIT';

        $ipalLogService->upsertProcess($request->validated(), $user);

        return redirect()
            ->route('dashboard.forms.catatan-pengolahan-limbah-air.create', [
                'user_id' => $user->external_id,
                'tanggal' => $request->validated()['tanggal'],
            ])
            ->with('success', $isSubmit ? 'Catatan proses berhasil di-submit.' : 'Catatan proses berhasil disimpan sebagai draft.');
    }

    public function b3StorageIndex(
        B3StorageLogIndexRequest $request,
        B3StoragePageService $pageService,
        IpalLogService $ipalLogService,
    ): Response {
        abort_unless($request->user()?->can('b3storage.monthly-report.view'), 403);

        return Inertia::render('dashboard/forms/penyimpanan-limbah-b3/index', [
            'listing' => $pageService->buildListing($this->authenticatedUser($request), $request->filters(), $ipalLogService),
        ]);
    }

    public function b3StorageMonthlyShow(
        B3StorageMonthlyPeriodRequest $request,
        B3StoragePageService $pageService,
        B3StorageService $b3StorageService,
        IpalLogService $ipalLogService,
    ): Response {
        abort_unless($request->user()?->can('b3storage.monthly-report.view'), 403);

        return Inertia::render('dashboard/forms/penyimpanan-limbah-b3/monthly', [
            'monthlyDetail' => $pageService->buildMonthlyDetail(
                $this->authenticatedUser($request),
                $request->year(),
                $request->month(),
                $b3StorageService,
                $ipalLogService,
                $request->filters(),
            ),
        ]);
    }

    public function b3StorageMonthlyPdf(
        B3StorageMonthlyPeriodRequest $request,
        B3StoragePageService $pageService,
        B3StorageService $b3StorageService,
        IpalLogService $ipalLogService,
    ): Responsable {
        abort_unless($request->user()?->can('b3storage.monthly-report.view'), 403);

        $detail = $pageService->buildMonthlyDetail(
            $this->authenticatedUser($request),
            $request->year(),
            $request->month(),
            $b3StorageService,
            $ipalLogService,
            $request->filters(),
        );

        return Pdf::view('pdf.b3-storage.monthly-detail', [
            'monthlyDetail' => $detail,
        ])
            ->landscape()
            ->format('a4')
            ->margins(8, 8, 10, 8)
            ->name("penyimpanan-limbah-b3-{$request->year()}-{$request->month()}.pdf");
    }

    public function b3StorageMonthlyExcel(
        B3StorageMonthlyPeriodRequest $request,
        B3StoragePageService $pageService,
        B3StorageService $b3StorageService,
        IpalLogService $ipalLogService,
        SimpleXlsx $simpleXlsx,
    ): SymfonyResponse {
        abort_unless($request->user()?->can('b3storage.monthly-report.view'), 403);

        $detail = $pageService->buildMonthlyDetail(
            $this->authenticatedUser($request),
            $request->year(),
            $request->month(),
            $b3StorageService,
            $ipalLogService,
            $request->filters(),
        );

        $directory = storage_path('app/exports');
        File::ensureDirectoryExists($directory);

        $filename = "penyimpanan-limbah-b3-{$request->year()}-{$request->month()}.xlsx";
        $path = $directory.DIRECTORY_SEPARATOR.uniqid('b3-storage-', true).'.xlsx';

        $simpleXlsx->store($pageService->buildMonthlyExcelRows($detail), $path);

        return response()
            ->download($path, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ])
            ->deleteFileAfterSend();
    }

    public function b3StorageLogPdf(
        Request $request,
        B3StorageLog $log,
        B3StoragePageService $pageService,
        B3StorageService $b3StorageService,
    ): Responsable {
        abort_unless($request->user()?->can('b3storage.logs.view'), 403);

        $this->authenticatedUser($request);
        $detail = $pageService->buildLogPdfDetail($b3StorageService->detail($log));

        return Pdf::view('pdf.b3-storage.log-detail', [
            'log' => $detail,
        ])
            ->format('a4')
            ->margins(10, 10, 12, 10)
            ->name("penyimpanan-limbah-b3-log-{$log->id}.pdf");
    }

    public function b3StorageApproveMonthly(
        B3StorageMonthlyApprovalRequest $request,
        B3StorageService $b3StorageService,
        IpalLogService $ipalLogService,
    ): RedirectResponse {
        abort_unless($request->user()?->can('b3storage.monthly-approval.approve'), 403);
        $user = $this->authenticatedUser($request);

        $b3StorageService->approveMonthly($request->approvalPayload(), $user, $ipalLogService);

        return redirect()
            ->route('dashboard.forms.penyimpanan-limbah-b3.monthly.show', [
                'year' => $request->year(),
                'month' => $request->month(),
                'user_id' => $user->external_id,
                ...array_filter($request->filters(), static fn (string $value): bool => $value !== ''),
            ])
            ->with('success', 'Approval bulanan limbah B3 berhasil disimpan.');
    }

    public function b3StorageCreate(
        Request $request,
        B3StoragePageService $pageService,
    ): Response {
        abort_unless($request->user()?->can('b3storage.logs.create'), 403);

        return Inertia::render('dashboard/forms/penyimpanan-limbah-b3/create', [
            'entryForm' => $pageService->buildForm($this->authenticatedUser($request)),
        ]);
    }

    public function b3StorageStore(
        StoreB3StorageLogRequest $request,
        B3StorageService $b3StorageService,
    ): RedirectResponse {
        abort_unless($request->user()?->can('b3storage.logs.create'), 403);
        $user = $this->authenticatedUser($request);

        $b3StorageService->createLog(
            $request->validated(),
            $user,
            $request->file('photo'),
        );

        $redirectRoute = $user->can('b3storage.monthly-report.view')
            ? 'dashboard.forms.penyimpanan-limbah-b3.index'
            : 'dashboard.forms.penyimpanan-limbah-b3.create';
        $redirectQuery = ['user_id' => $user->external_id];

        if ($user->can('b3storage.monthly-report.view')) {
            $redirectQuery['month'] = now()->month;
            $redirectQuery['year'] = now()->year;
        }

        return redirect()
            ->route($redirectRoute, $redirectQuery)
            ->with('success', 'Log penyimpanan limbah B3 berhasil disimpan.');
    }

    public function b3StoragePhoto(Request $request, B3StorageLog $log): SymfonyResponse
    {
        abort_unless($request->user()?->can('b3storage.logs.view'), 403);

        $this->authenticatedUser($request);

        if (! is_string($log->photo_path) || $log->photo_path === '') {
            abort(404);
        }

        if (! Storage::disk('public')->exists($log->photo_path)) {
            abort(404);
        }

        return Storage::disk('public')->response($log->photo_path);
    }

    private function authenticatedUser(Request $request): User
    {
        $user = $request->user();

        if (! $user instanceof User) {
            abort(HttpResponse::HTTP_UNAUTHORIZED, 'User tidak terautentikasi.');
        }

        return $user;
    }

    private function canViewIpalAttachment(User $viewer, IpalDailyLog $log): bool
    {
        if ($viewer->id === $log->operator_id) {
            return true;
        }

        return $viewer->can('ipal.logs.approve')
            || $viewer->can('ipal.logs.reopen')
            || $viewer->can('ipal.logs.reopen-monthly');
    }
}
