<?php

namespace App\Models\B3Storage;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class B3StorageMonthlyApproval extends Model
{
    use HasFactory;

    protected $table = 'b3_storage_monthly_approvals';

    protected $fillable = [
        'month',
        'year',
        'environment_supervisor_id',
        'environment_supervisor_signed_at',
        'hse_department_head_id',
        'hse_department_head_signed_at',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'month' => 'integer',
            'year' => 'integer',
            'environment_supervisor_signed_at' => 'datetime',
            'hse_department_head_signed_at' => 'datetime',
        ];
    }

    public function environmentSupervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'environment_supervisor_id');
    }

    public function hseDepartmentHead(): BelongsTo
    {
        return $this->belongsTo(User::class, 'hse_department_head_id');
    }
}
