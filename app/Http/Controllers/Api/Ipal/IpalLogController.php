<?php

namespace App\Http\Controllers\Api\Ipal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ipal\ApproveIpalLogRequest;
use App\Http\Requests\Ipal\StoreIpalLogRequest;
use App\Models\Ipal\IpalDailyLog;
use App\Models\User;
use App\Services\Ipal\IpalLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class IpalLogController extends Controller
{
    public function __construct(
        private readonly IpalLogService $ipalLogService,
    ) {}

    public function store(StoreIpalLogRequest $request): JsonResponse
    {
        $log = $this->ipalLogService->createLog($request->validated(), $this->authenticatedUser($request));

        return response()->json([
            'message' => 'Log IPAL berhasil disimpan.',
            'data' => $this->ipalLogService->detail($log),
        ], 201);
    }

    public function show(IpalDailyLog $log): JsonResponse
    {
        return response()->json([
            'data' => $this->ipalLogService->detail($log),
        ]);
    }

    public function submit(Request $request, IpalDailyLog $log): JsonResponse
    {
        $processLog = $this->ipalLogService->submit($log, $this->authenticatedUser($request));

        return response()->json([
            'message' => 'Log IPAL berhasil di-submit.',
            'data' => $processLog->load('approval'),
        ]);
    }

    public function approve(ApproveIpalLogRequest $request, IpalDailyLog $log): JsonResponse
    {
        $processLog = $this->ipalLogService->approve($log, $this->authenticatedUser($request));

        return response()->json([
            'message' => 'Log IPAL berhasil di-approve.',
            'data' => $processLog->load('approval'),
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
