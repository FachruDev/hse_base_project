<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class IpalProcessLog extends Model
{
    use HasFactory;

    protected $table = 'ipal_process_logs';

    protected $fillable = [
        'log_id',
        'template_id',
        'status',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
        ];
    }

    public function dailyLog(): BelongsTo
    {
        return $this->belongsTo(IpalDailyLog::class, 'log_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(ProcessTemplate::class, 'template_id');
    }

    public function values(): HasMany
    {
        return $this->hasMany(IpalProcessValue::class, 'process_log_id');
    }

    public function batches(): HasMany
    {
        return $this->hasMany(IpalBatch::class, 'process_log_id');
    }

    public function approval(): HasOne
    {
        return $this->hasOne(IpalProcessApproval::class, 'process_log_id');
    }
}
