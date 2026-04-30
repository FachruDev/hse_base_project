<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IpalChecklistValue extends Model
{
    use HasFactory;

    protected $table = 'ipal_checklist_values';

    protected $fillable = [
        'checklist_id',
        'item_id',
        'status',
        'note',
    ];

    public function checklist(): BelongsTo
    {
        return $this->belongsTo(IpalChecklist::class, 'checklist_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(ChecklistItem::class, 'item_id');
    }
}
