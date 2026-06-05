<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BatchSection extends Model
{
    use HasFactory;

    protected $table = 'm_batch_sections';

    protected $fillable = [
        'name',
        'order_no',
    ];

    protected function casts(): array
    {
        return [
            'order_no' => 'integer',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(BatchItem::class, 'section_id');
    }
}
