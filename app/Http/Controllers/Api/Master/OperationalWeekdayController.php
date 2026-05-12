<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\SaveOperationalWeekdayRequest;
use App\Models\Master\OperationalWeekday;
use Illuminate\Http\JsonResponse;

class OperationalWeekdayController extends Controller
{
    public function index(): JsonResponse
    {
        $weekdays = OperationalWeekday::query()
            ->orderBy('day_of_week_iso')
            ->paginate(20);

        return response()->json($weekdays);
    }

    public function store(SaveOperationalWeekdayRequest $request): JsonResponse
    {
        $weekday = OperationalWeekday::query()->create($request->validated());

        return response()->json([
            'message' => 'Konfigurasi weekend berhasil dibuat.',
            'data' => $weekday,
        ], 201);
    }

    public function show(OperationalWeekday $operationalWeekday): JsonResponse
    {
        return response()->json([
            'data' => $operationalWeekday,
        ]);
    }

    public function update(
        SaveOperationalWeekdayRequest $request,
        OperationalWeekday $operationalWeekday,
    ): JsonResponse {
        $operationalWeekday->update($request->validated());

        return response()->json([
            'message' => 'Konfigurasi weekend berhasil diperbarui.',
            'data' => $operationalWeekday->fresh(),
        ]);
    }

    public function destroy(OperationalWeekday $operationalWeekday): JsonResponse
    {
        $operationalWeekday->delete();

        return response()->json([
            'message' => 'Konfigurasi weekend berhasil dihapus.',
        ]);
    }
}
