<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IpalProcessApproval extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    protected $table = 'ipal_process_approvals';

    protected $fillable = [
        'process_log_id',
        'operator_id',
        'operator_signed_at',
        'supervisor_id',
        'supervisor_signed_at',
    ];

    protected function casts(): array
    {
        return [
            'operator_signed_at' => 'datetime',
            'supervisor_signed_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function processLog(): BelongsTo
    {
        return $this->belongsTo(IpalProcessLog::class, 'process_log_id');
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }
}
