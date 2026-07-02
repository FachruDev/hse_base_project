<?php

namespace App\Http\Controllers\Api\B3Storage;

use App\Http\Controllers\Controller;
use App\Http\Requests\B3Storage\ApproveB3StorageMonthlyRequest;
use App\Http\Requests\B3Storage\B3StorageMonthlyReportRequest;
use App\Models\User;
use App\Services\B3Storage\B3StorageService;
use App\Services\Ipal\IpalLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class B3StorageMonthlyReportController extends Controller
{
    public function __construct(
        private readonly B3StorageService $b3StorageService,
        private readonly IpalLogService $ipalLogService,
    ) {}

    public function index(B3StorageMonthlyReportRequest $request): JsonResponse
    {
        $report = $this->b3StorageService->monthlyReport(
            (int) $request->validated('month'),
            (int) $request->validated('year'),
        );

        return response()->json([
            'data' => $report,
        ]);
    }

    public function approve(
        ApproveB3StorageMonthlyRequest $request,
    ): JsonResponse {
        $validated = $request->validated();

        $signedUser = isset($validated['signer_user_id'])
            ? User::query()->findOrFail((int) $validated['signer_user_id'])
            : $this->authenticatedUser($request);

        $approval = $this->b3StorageService->approveMonthly($validated, $signedUser, $this->ipalLogService);

        return response()->json([
            'message' => 'Approval bulanan limbah B3 berhasil disimpan.',
            'data' => $approval,
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
