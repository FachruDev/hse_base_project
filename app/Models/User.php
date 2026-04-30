<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
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
            'created_at' => 'datetime',
        ];
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
}
