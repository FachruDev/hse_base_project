<?php

namespace App\Http\Controllers\Api\B3Storage;

use App\Http\Controllers\Controller;
use App\Http\Requests\B3Storage\SaveB3StorageInitiatorDepartmentRequest;
use App\Models\B3Storage\B3StorageInitiatorDepartment;
use Illuminate\Http\JsonResponse;

class B3StorageInitiatorDepartmentController extends Controller
{
    public function index(): JsonResponse
    {
        $departments = B3StorageInitiatorDepartment::query()
            ->orderBy('order_no')
            ->orderBy('id')
            ->paginate(50);

        return response()->json($departments);
    }

    public function store(SaveB3StorageInitiatorDepartmentRequest $request): JsonResponse
    {
        $department = B3StorageInitiatorDepartment::query()->create($request->validated());

        return response()->json([
            'message' => 'Dept inisiator B3 berhasil dibuat.',
            'data' => $department,
        ], 201);
    }

    public function show(B3StorageInitiatorDepartment $initiatorDepartment): JsonResponse
    {
        return response()->json([
            'data' => $initiatorDepartment,
        ]);
    }

    public function update(
        SaveB3StorageInitiatorDepartmentRequest $request,
        B3StorageInitiatorDepartment $initiatorDepartment,
    ): JsonResponse {
        $initiatorDepartment->update($request->validated());

        return response()->json([
            'message' => 'Dept inisiator B3 berhasil diperbarui.',
            'data' => $initiatorDepartment->fresh(),
        ]);
    }

    public function destroy(B3StorageInitiatorDepartment $initiatorDepartment): JsonResponse
    {
        $initiatorDepartment->delete();

        return response()->json([
            'message' => 'Dept inisiator B3 berhasil dihapus.',
        ]);
    }
}
