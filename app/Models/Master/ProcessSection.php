<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProcessSection extends Model
{
    use HasFactory;

    protected $table = 'm_process_sections';

    protected $fillable = [
        'template_id',
        'name',
        'order_no',
    ];

    protected function casts(): array
    {
        return [
            'order_no' => 'integer',
        ];
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(ProcessTemplate::class, 'template_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ProcessItem::class, 'section_id');
    }
}
