<?php

namespace Database\Seeders;

use App\Models\Master\OperationalWeekday;
use Illuminate\Database\Seeder;

class OperationalCalendarSeeder extends Seeder
{
    public function run(): void
    {
        $weekdays = [
            ['day_of_week_iso' => 1, 'day_name' => 'Senin', 'is_off' => false],
            ['day_of_week_iso' => 2, 'day_name' => 'Selasa', 'is_off' => false],
            ['day_of_week_iso' => 3, 'day_name' => 'Rabu', 'is_off' => false],
            ['day_of_week_iso' => 4, 'day_name' => 'Kamis', 'is_off' => false],
            ['day_of_week_iso' => 5, 'day_name' => 'Jumat', 'is_off' => false],
            ['day_of_week_iso' => 6, 'day_name' => 'Sabtu', 'is_off' => true],
            ['day_of_week_iso' => 7, 'day_name' => 'Minggu', 'is_off' => true],
        ];

        foreach ($weekdays as $weekday) {
            OperationalWeekday::query()->updateOrCreate(
                ['day_of_week_iso' => $weekday['day_of_week_iso']],
                $weekday,
            );
        }
    }
}
