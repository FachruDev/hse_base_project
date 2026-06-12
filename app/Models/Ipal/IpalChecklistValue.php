<?php

namespace App\Models\Ipal;

use App\Models\Master\ChecklistItem;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    protected $appends = [
        'status_label',
    ];

    /**
     * @return Attribute<string, never>
     */
    protected function statusLabel(): Attribute
    {
        return Attribute::get(fn (): string => match ($this->status) {
            'OK' => 'Berfungsi',
            'NOT_OK' => 'Tidak Berfungsi',
            'NA' => 'Tidak Berlaku',
            default => (string) $this->status,
        });
    }

    public function checklist(): BelongsTo
    {
        return $this->belongsTo(IpalChecklist::class, 'checklist_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(ChecklistItem::class, 'item_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(IpalChecklistValueAttachment::class, 'checklist_value_id');
    }
}
