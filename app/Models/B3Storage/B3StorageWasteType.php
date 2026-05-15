<?php

namespace App\Models\B3Storage;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class B3StorageWasteType extends Model
{
    use HasFactory;

    protected $table = 'm_b3_storage_waste_types';

    protected $fillable = [
        'name',
        'order_no',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'order_no' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function logs(): HasMany
    {
        return $this->hasMany(B3StorageLog::class, 'waste_type_id');
    }
}
