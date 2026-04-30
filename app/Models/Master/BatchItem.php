<?php

namespace App\Models\Master;

use App\Models\Ipal\IpalBatchValue;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BatchItem extends Model
{
    use HasFactory;

    protected $table = 'm_batch_items';

    protected $fillable = [
        'name',
        'input_type',
        'order_no',
    ];

    protected function casts(): array
    {
        return [
            'order_no' => 'integer',
        ];
    }

    public function values(): HasMany
    {
        return $this->hasMany(IpalBatchValue::class, 'item_id');
    }
}
