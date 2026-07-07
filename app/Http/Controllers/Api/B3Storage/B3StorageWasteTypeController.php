<?php

namespace App\Http\Controllers\Api\B3Storage;

use App\Http\Controllers\Controller;
use App\Http\Requests\B3Storage\SaveB3StorageWasteTypeRequest;
use App\Models\B3Storage\B3StorageWasteType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class B3StorageWasteTypeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('b3storage.master.view'), Response::HTTP_FORBIDDEN);

        $wasteTypes = B3StorageWasteType::query()
            ->orderBy('order_no')
            ->orderBy('id')
            ->paginate(50);

        return response()->json($wasteTypes);
    }

    public function store(SaveB3StorageWasteTypeRequest $request): JsonResponse
    {
        abort_unless($request->user()?->can('b3storage.master.manage'), Response::HTTP_FORBIDDEN);

        $wasteType = B3StorageWasteType::query()->create($request->validated());

        return response()->json([
            'message' => 'Jenis limbah B3 berhasil dibuat.',
            'data' => $wasteType,
        ], 201);
    }

    public function show(Request $request, B3StorageWasteType $wasteType): JsonResponse
    {
        abort_unless($request->user()?->can('b3storage.master.view'), Response::HTTP_FORBIDDEN);

        return response()->json([
            'data' => $wasteType,
        ]);
    }

    public function update(
        SaveB3StorageWasteTypeRequest $request,
        B3StorageWasteType $wasteType,
    ): JsonResponse {
        abort_unless($request->user()?->can('b3storage.master.manage'), Response::HTTP_FORBIDDEN);

        $wasteType->update($request->validated());

        return response()->json([
            'message' => 'Jenis limbah B3 berhasil diperbarui.',
            'data' => $wasteType->fresh(),
        ]);
    }

    public function destroy(Request $request, B3StorageWasteType $wasteType): JsonResponse
    {
        abort_unless($request->user()?->can('b3storage.master.manage'), Response::HTTP_FORBIDDEN);

        $wasteType->delete();

        return response()->json([
            'message' => 'Jenis limbah B3 berhasil dihapus.',
        ]);
    }
}
