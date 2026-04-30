<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Web\MasterDataIndexRequest;
use App\Http\Requests\Web\SaveMasterDataRequest;
use App\Services\Web\MasterDataCrudService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MasterDataController extends Controller
{
    public function index(
        MasterDataIndexRequest $request,
        string $module,
        MasterDataCrudService $masterDataCrudService,
    ): Response {
        abort_unless($request->user()?->can($masterDataCrudService->viewPermission($module)), 403);

        return Inertia::render('dashboard/master-data/index', [
            'masterData' => $masterDataCrudService->buildPage(
                $module,
                $request->filters(),
                $request->user()?->can($masterDataCrudService->managePermission($module)) ?? false,
            ),
        ]);
    }

    public function store(
        SaveMasterDataRequest $request,
        string $module,
        MasterDataCrudService $masterDataCrudService,
    ): RedirectResponse {
        abort_unless($request->user()?->can($masterDataCrudService->managePermission($module)), 403);

        $masterDataCrudService->store($module, $request->payload());

        return redirect()
            ->back()
            ->with('success', 'Data master berhasil dibuat.');
    }

    public function update(
        SaveMasterDataRequest $request,
        string $module,
        int $record,
        MasterDataCrudService $masterDataCrudService,
    ): RedirectResponse {
        abort_unless($request->user()?->can($masterDataCrudService->managePermission($module)), 403);

        $masterDataCrudService->update($module, $record, $request->payload());

        return redirect()
            ->back()
            ->with('success', 'Data master berhasil diperbarui.');
    }

    public function destroy(
        Request $request,
        string $module,
        int $record,
        MasterDataCrudService $masterDataCrudService,
    ): RedirectResponse {
        abort_unless($request->user()?->can($masterDataCrudService->managePermission($module)), 403);

        $masterDataCrudService->delete($module, $record);

        return redirect()
            ->back()
            ->with('success', 'Data master berhasil dihapus.');
    }
}
