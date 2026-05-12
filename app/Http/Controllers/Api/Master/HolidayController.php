<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\SaveHolidayRequest;
use App\Models\Master\Holiday;
use Illuminate\Http\JsonResponse;

class HolidayController extends Controller
{
    public function index(): JsonResponse
    {
        $holidays = Holiday::query()
            ->orderByDesc('holiday_date')
            ->paginate(20);

        return response()->json($holidays);
    }

    public function store(SaveHolidayRequest $request): JsonResponse
    {
        $holiday = Holiday::query()->create($request->validated());

        return response()->json([
            'message' => 'Hari libur berhasil dibuat.',
            'data' => $holiday,
        ], 201);
    }

    public function show(Holiday $holiday): JsonResponse
    {
        return response()->json([
            'data' => $holiday,
        ]);
    }

    public function update(SaveHolidayRequest $request, Holiday $holiday): JsonResponse
    {
        $holiday->update($request->validated());

        return response()->json([
            'message' => 'Hari libur berhasil diperbarui.',
            'data' => $holiday->fresh(),
        ]);
    }

    public function destroy(Holiday $holiday): JsonResponse
    {
        $holiday->delete();

        return response()->json([
            'message' => 'Hari libur berhasil dihapus.',
        ]);
    }
}
