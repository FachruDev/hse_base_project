<?php

namespace App\Http\Controllers\Api\B3Storage;

use App\Http\Controllers\Controller;
use App\Http\Requests\B3Storage\StoreB3StorageLogRequest;
use App\Http\Requests\B3Storage\UpdateB3StorageLogRequest;
use App\Models\B3Storage\B3StorageLog;
use App\Models\User;
use App\Services\B3Storage\B3StorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class B3StorageLogController extends Controller
{
    public function __construct(
        private readonly B3StorageService $b3StorageService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('b3storage.logs.view'), Response::HTTP_FORBIDDEN);

        $month = $request->integer('month');
        $year = $request->integer('year');
        $perPage = max(1, min(100, $request->integer('per_page', 50)));

        $logs = $this->b3StorageService->logsIndex(
            $month > 0 ? $month : null,
            $year > 0 ? $year : null,
            $perPage,
        );

        return response()->json($logs);
    }

    public function store(StoreB3StorageLogRequest $request): JsonResponse
    {
        abort_unless($request->user()?->can('b3storage.logs.create'), Response::HTTP_FORBIDDEN);

        $log = $this->b3StorageService->createLog(
            $request->validated(),
            $this->authenticatedUser($request),
            $request->file('photo'),
        );

        return response()->json([
            'message' => 'Log penyimpanan limbah B3 berhasil dibuat.',
            'data' => $log,
        ], 201);
    }

    public function show(Request $request, B3StorageLog $log): JsonResponse
    {
        abort_unless($request->user()?->can('b3storage.logs.view'), Response::HTTP_FORBIDDEN);

        return response()->json([
            'data' => $this->b3StorageService->detail($log),
        ]);
    }

    public function update(UpdateB3StorageLogRequest $request, B3StorageLog $log): JsonResponse
    {
        abort_unless($request->user()?->can('b3storage.logs.update'), Response::HTTP_FORBIDDEN);

        $updatedLog = $this->b3StorageService->updateLog(
            $log,
            $request->validated(),
            $this->authenticatedUser($request),
            $request->file('photo'),
        );

        return response()->json([
            'message' => 'Log penyimpanan limbah B3 berhasil diperbarui.',
            'data' => $updatedLog,
        ]);
    }

    public function destroy(Request $request, B3StorageLog $log): JsonResponse
    {
        abort_unless($request->user()?->can('b3storage.logs.delete'), Response::HTTP_FORBIDDEN);

        $this->b3StorageService->deleteLog($log);

        return response()->json([
            'message' => 'Log penyimpanan limbah B3 berhasil dihapus.',
        ]);
    }

    public function photo(Request $request, B3StorageLog $log): StreamedResponse
    {
        abort_unless($request->user()?->can('b3storage.logs.view'), Response::HTTP_FORBIDDEN);

        if (! is_string($log->photo_path) || $log->photo_path === '') {
            abort(Response::HTTP_NOT_FOUND, 'Foto tidak tersedia.');
        }

        if (! Storage::disk('public')->exists($log->photo_path)) {
            abort(Response::HTTP_NOT_FOUND, 'File foto tidak ditemukan.');
        }

        return Storage::disk('public')->response($log->photo_path);
    }

    private function authenticatedUser(Request $request): User
    {
        $user = $request->user();

        if (! $user instanceof User) {
            abort(Response::HTTP_UNAUTHORIZED, 'User tidak terautentikasi.');
        }

        return $user;
    }
}
