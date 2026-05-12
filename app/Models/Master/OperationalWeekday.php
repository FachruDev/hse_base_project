<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OperationalWeekday extends Model
{
    use HasFactory;

    protected $table = 'm_operational_weekdays';

    protected $fillable = [
        'day_of_week_iso',
        'day_name',
        'is_off',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'day_of_week_iso' => 'integer',
            'is_off' => 'boolean',
        ];
    }
}
