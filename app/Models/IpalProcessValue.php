<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IpalProcessValue extends Model
{
    use HasFactory;

    protected $table = 'ipal_process_values';

    protected $fillable = [
        'process_log_id',
        'item_id',
        'value_text',
        'value_number',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'value_number' => 'decimal:4',
        ];
    }

    public function processLog(): BelongsTo
    {
        return $this->belongsTo(IpalProcessLog::class, 'process_log_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(ProcessItem::class, 'item_id');
    }
}
