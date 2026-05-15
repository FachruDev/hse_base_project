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

class B3StorageLogController extends Controller
{
    public function __construct(
        private readonly B3StorageService $b3StorageService,
    ) {}

    public function index(Request $request): JsonResponse
    {
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

    public function show(B3StorageLog $log): JsonResponse
    {
        return response()->json([
            'data' => $this->b3StorageService->detail($log),
        ]);
    }

    public function update(UpdateB3StorageLogRequest $request, B3StorageLog $log): JsonResponse
    {
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

    public function destroy(B3StorageLog $log): JsonResponse
    {
        $this->b3StorageService->deleteLog($log);

        return response()->json([
            'message' => 'Log penyimpanan limbah B3 berhasil dihapus.',
        ]);
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
