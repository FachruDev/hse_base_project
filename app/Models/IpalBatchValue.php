<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IpalBatchValue extends Model
{
    use HasFactory;

    protected $table = 'ipal_batch_values';

    protected $fillable = [
        'batch_id',
        'item_id',
        'value_text',
        'value_number',
    ];

    protected function casts(): array
    {
        return [
            'value_number' => 'decimal:4',
        ];
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(IpalBatch::class, 'batch_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(BatchItem::class, 'item_id');
    }
}
