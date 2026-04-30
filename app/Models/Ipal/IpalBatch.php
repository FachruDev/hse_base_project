<?php

namespace App\Models\Ipal;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IpalBatch extends Model
{
    use HasFactory;

    protected $table = 'ipal_batches';

    protected $fillable = [
        'process_log_id',
        'batch_no',
    ];

    protected function casts(): array
    {
        return [
            'batch_no' => 'integer',
        ];
    }

    public function processLog(): BelongsTo
    {
        return $this->belongsTo(IpalProcessLog::class, 'process_log_id');
    }

    public function values(): HasMany
    {
        return $this->hasMany(IpalBatchValue::class, 'batch_id');
    }
}
