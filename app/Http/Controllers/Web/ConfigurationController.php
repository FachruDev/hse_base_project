<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\SaveHolidayRequest;
use App\Http\Requests\Web\HolidayConfigurationIndexRequest;
use App\Http\Requests\Web\UpdateOperationalWeekdayStatusRequest;
use App\Models\Master\Holiday;
use App\Models\Master\OperationalWeekday;
use App\Services\Web\ConfigurationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConfigurationController extends Controller
{
    public function weekendIndex(
        Request $request,
        ConfigurationService $configurationService,
    ): Response {
        abort_unless($request->user()?->can('config.weekend.view'), 403);

        return Inertia::render('dashboard/configuration/weekend/index', [
            'weekendConfiguration' => $configurationService->buildWeekendPage(
                $request->user()?->can('config.weekend.manage') ?? false,
            ),
        ]);
    }

    public function weekendUpdate(
        UpdateOperationalWeekdayStatusRequest $request,
        OperationalWeekday $operationalWeekday,
    ): RedirectResponse {
        abort_unless($request->user()?->can('config.weekend.manage'), 403);

        $operationalWeekday->update([
            'is_off' => (bool) $request->validated()['is_off'],
        ]);

        return redirect()
            ->back()
            ->with('success', 'Konfigurasi weekend berhasil diperbarui.');
    }

    public function holidayIndex(
        HolidayConfigurationIndexRequest $request,
        ConfigurationService $configurationService,
    ): Response {
        abort_unless($request->user()?->can('config.holiday.view'), 403);

        return Inertia::render('dashboard/configuration/holiday/index', [
            'holidayConfiguration' => $configurationService->buildHolidayPage(
                $request->filters(),
                $request->user()?->can('config.holiday.manage') ?? false,
            ),
        ]);
    }

    public function holidayStore(
        SaveHolidayRequest $request,
    ): RedirectResponse {
        abort_unless($request->user()?->can('config.holiday.manage'), 403);

        Holiday::query()->create($request->validated());

        return redirect()
            ->back()
            ->with('success', 'Holiday berhasil dibuat.');
    }

    public function holidayUpdate(
        SaveHolidayRequest $request,
        Holiday $holiday,
    ): RedirectResponse {
        abort_unless($request->user()?->can('config.holiday.manage'), 403);

        $holiday->update($request->validated());

        return redirect()
            ->back()
            ->with('success', 'Holiday berhasil diperbarui.');
    }

    public function holidayDestroy(
        Request $request,
        Holiday $holiday,
    ): RedirectResponse {
        abort_unless($request->user()?->can('config.holiday.manage'), 403);

        $holiday->delete();

        return redirect()
            ->back()
            ->with('success', 'Holiday berhasil dihapus.');
    }
}
