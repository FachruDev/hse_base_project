<?php

namespace App\Models\B3Storage;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class B3StorageLog extends Model
{
    use HasFactory;

    protected $table = 'b3_storage_logs';

    protected $fillable = [
        'movement_date',
        'movement_time',
        'movement_type',
        'waste_type_id',
        'waste_type_other',
        'initiator_department_id',
        'initiator_department_other',
        'initiator_user_id',
        'weight_kg',
        'document_number',
        'photo_path',
        'note',
        'operator_id',
    ];

    protected function casts(): array
    {
        return [
            'movement_date' => 'date',
            'weight_kg' => 'decimal:3',
            'created_at' => 'datetime',
        ];
    }

    public function wasteType(): BelongsTo
    {
        return $this->belongsTo(B3StorageWasteType::class, 'waste_type_id');
    }

    public function initiatorDepartment(): BelongsTo
    {
        return $this->belongsTo(B3StorageInitiatorDepartment::class, 'initiator_department_id');
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    public function initiatorUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiator_user_id');
    }
}
