<?php

namespace App\Models\Ipal;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class IpalDailyLog extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    protected $table = 'ipal_daily_log';

    protected $fillable = [
        'tanggal',
        'operator_id',
        'day_type',
        'is_operational',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'is_operational' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    public function checklist(): HasOne
    {
        return $this->hasOne(IpalChecklist::class, 'log_id');
    }

    public function processLog(): HasOne
    {
        return $this->hasOne(IpalProcessLog::class, 'log_id');
    }
}
