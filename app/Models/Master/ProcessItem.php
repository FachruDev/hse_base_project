<?php

namespace App\Models\Master;

use App\Models\Ipal\IpalProcessValue;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProcessItem extends Model
{
    use HasFactory;

    protected $table = 'm_process_items';

    protected $fillable = [
        'section_id',
        'name',
        'standard_condition',
        'input_type',
        'order_no',
    ];

    protected function casts(): array
    {
        return [
            'order_no' => 'integer',
        ];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(ProcessSection::class, 'section_id');
    }

    public function values(): HasMany
    {
        return $this->hasMany(IpalProcessValue::class, 'item_id');
    }
}
