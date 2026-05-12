<?php

namespace App\Services\Ipal;

use App\Models\Master\Holiday;
use App\Models\Master\OperationalWeekday;
use Carbon\CarbonInterface;

class OperationalCalendarService
{
    public const DAY_TYPE_OPERATIONAL = 'OPERATIONAL';

    public const DAY_TYPE_WEEKEND = 'WEEKEND';

    public const DAY_TYPE_HOLIDAY = 'HOLIDAY';

    /**
     * @return array{day_type: string, is_operational: bool, label: string}
     */
    public function resolveContext(CarbonInterface $date): array
    {
        $dateString = $date->toDateString();

        $holiday = Holiday::query()
            ->whereDate('holiday_date', $dateString)
            ->where('is_active', true)
            ->first();

        if ($holiday instanceof Holiday) {
            return [
                'day_type' => self::DAY_TYPE_HOLIDAY,
                'is_operational' => false,
                'label' => $holiday->name,
            ];
        }

        $weekday = OperationalWeekday::query()
            ->where('day_of_week_iso', $date->dayOfWeekIso)
            ->first();

        if ($weekday instanceof OperationalWeekday && $weekday->is_off) {
            return [
                'day_type' => self::DAY_TYPE_WEEKEND,
                'is_operational' => false,
                'label' => $weekday->day_name,
            ];
        }

        return [
            'day_type' => self::DAY_TYPE_OPERATIONAL,
            'is_operational' => true,
            'label' => 'Hari Operasional',
        ];
    }

    public function isOperational(CarbonInterface $date): bool
    {
        return $this->resolveContext($date)['is_operational'];
    }
}
