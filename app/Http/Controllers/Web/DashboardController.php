<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\B3Storage\StoreB3StorageLogRequest;
use App\Http\Requests\Web\B3StorageLogIndexRequest;
use App\Http\Requests\Web\CatatanPengolahanLimbahAirIndexRequest;
use App\Http\Requests\Web\IpalEntryDateRequest;
use App\Http\Requests\Web\IpalMonthlyPeriodRequest;
use App\Http\Requests\Web\SaveIpalChecklistRequest;
use App\Http\Requests\Web\SaveIpalProcessRequest;
use App\Models\B3Storage\B3StorageLog;
use App\Models\Ipal\IpalDailyLog;
use App\Models\User;
use App\Services\B3Storage\B3StorageService;
use App\Services\Ipal\IpalLogService;
use App\Services\Web\B3StoragePageService;
use App\Services\Web\CatatanPengolahanLimbahAirPageService;
use App\Services\Web\DashboardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

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
    ): Response {
        return Inertia::render('dashboard/forms/catatan-pengolahan-limbah-air/index', [
            'listing' => $pageService->buildListing($request->user(), $request->filters()),
        ]);
    }

    public function catatanPengolahanLimbahAirCreate(
        IpalEntryDateRequest $request,
        CatatanPengolahanLimbahAirPageService $pageService,
    ): Response {
        return Inertia::render('dashboard/forms/catatan-pengolahan-limbah-air/create', [
            'entryForm' => $pageService->buildForm($this->authenticatedUser($request), $request->entryDate()),
        ]);
    }

    public function catatanPengolahanLimbahAirMonthlyShow(
        IpalMonthlyPeriodRequest $request,
        CatatanPengolahanLimbahAirPageService $pageService,
    ): Response {
        return Inertia::render('dashboard/forms/catatan-pengolahan-limbah-air/monthly', [
            'monthlyDetail' => $pageService->buildMonthlyDetail(
                $this->authenticatedUser($request),
                $request->year(),
                $request->month(),
            ),
        ]);
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
        $this->authenticatedUser($request);

        return Inertia::render('dashboard/forms/catatan-pengolahan-limbah-air/show', [
            'entryForm' => $pageService->buildDailyDetail($log),
        ]);
    }

    public function catatanPengolahanLimbahAirSaveChecklist(
        SaveIpalChecklistRequest $request,
        IpalLogService $ipalLogService,
    ): RedirectResponse {
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
    ): Response {
        abort_unless($request->user()?->can('b3storage.logs.view'), 403);

        return Inertia::render('dashboard/forms/penyimpanan-limbah-b3/index', [
            'listing' => $pageService->buildListing($this->authenticatedUser($request), $request->filters()),
        ]);
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

        return redirect()
            ->route('dashboard.forms.penyimpanan-limbah-b3.index', [
                'user_id' => $user->external_id,
                'month' => now()->month,
                'year' => now()->year,
            ])
            ->with('success', 'Log penyimpanan limbah B3 berhasil disimpan.');
    }

    public function b3StoragePhoto(Request $request, B3StorageLog $log): HttpResponse
    {
        abort_unless($request->user()?->can('b3storage.logs.view'), 403);

        $user = $this->authenticatedUser($request);
        if (! $user->can('b3storage.logs.delete') && $log->operator_id !== $user->id) {
            abort(403);
        }

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
}
