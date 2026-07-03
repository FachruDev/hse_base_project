<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Web\ManagementIndexRequest;
use App\Http\Requests\Web\SaveManagementRequest;
use App\Services\Web\ManagementCrudService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ManagementController extends Controller
{
    public function index(
        ManagementIndexRequest $request,
        string $module,
        ManagementCrudService $managementCrudService,
    ): Response {
        $user = $request->user();

        abort_unless($managementCrudService->canPerform($user, $module, 'view'), 403);

        return Inertia::render('dashboard/management/index', [
            'management' => $managementCrudService->buildPage($module, $request->filters(), $user),
        ]);
    }

    public function store(
        SaveManagementRequest $request,
        string $module,
        ManagementCrudService $managementCrudService,
    ): RedirectResponse {
        abort_unless($managementCrudService->canPerform($request->user(), $module, 'create'), 403);

        $managementCrudService->store($module, $request->payload());

        return redirect()
            ->back()
            ->with('success', 'Data management berhasil dibuat.');
    }

    public function update(
        SaveManagementRequest $request,
        string $module,
        int $record,
        ManagementCrudService $managementCrudService,
    ): RedirectResponse {
        abort_unless($managementCrudService->canPerform($request->user(), $module, 'update'), 403);

        $managementCrudService->update($module, $record, $request->payload());

        return redirect()
            ->back()
            ->with('success', 'Data management berhasil diperbarui.');
    }

    public function destroy(
        Request $request,
        string $module,
        int $record,
        ManagementCrudService $managementCrudService,
    ): RedirectResponse {
        abort_unless($managementCrudService->canPerform($request->user(), $module, 'delete'), 403);

        $managementCrudService->delete($module, $record);

        return redirect()
            ->back()
            ->with('success', 'Data management berhasil dihapus.');
    }
}
