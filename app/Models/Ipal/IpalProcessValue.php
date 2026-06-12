<?php

namespace App\Models\Ipal;

use App\Models\Master\ProcessItem;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function attachments(): HasMany
    {
        return $this->hasMany(IpalProcessValueAttachment::class, 'process_value_id');
    }
}
