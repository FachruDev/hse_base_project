<?php

namespace App\Models;

use App\Models\B3Storage\B3StorageLog;
use App\Models\B3Storage\B3StorageMonthlyApproval;
use App\Models\Ipal\IpalChecklistApproval;
use App\Models\Ipal\IpalDailyLog;
use App\Models\Ipal\IpalProcessApproval;
use App\Models\Master\Department;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory;

    use HasRoles;
    use Notifiable;

    public const UPDATED_AT = null;

    protected $fillable = [
        'external_id',
        'name',
        'department_id',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'department_id' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function ipalDailyLogs(): HasMany
    {
        return $this->hasMany(IpalDailyLog::class, 'operator_id');
    }

    public function processApprovalsAsOperator(): HasMany
    {
        return $this->hasMany(IpalProcessApproval::class, 'operator_id');
    }

    public function processApprovalsAsSupervisor(): HasMany
    {
        return $this->hasMany(IpalProcessApproval::class, 'supervisor_id');
    }

    public function checklistApprovalsAsSupervisor(): HasMany
    {
        return $this->hasMany(IpalChecklistApproval::class, 'supervisor_id');
    }

    public function b3StorageLogs(): HasMany
    {
        return $this->hasMany(B3StorageLog::class, 'operator_id');
    }

    public function b3MonthlyApprovalsAsEnvironmentSupervisor(): HasMany
    {
        return $this->hasMany(B3StorageMonthlyApproval::class, 'environment_supervisor_id');
    }

    public function b3MonthlyApprovalsAsHseDepartmentHead(): HasMany
    {
        return $this->hasMany(B3StorageMonthlyApproval::class, 'hse_department_head_id');
    }
}
