<?php

namespace App\Models\Ipal;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IpalProcessMonthlyApproval extends Model
{
    use HasFactory;

    protected $table = 'ipal_process_monthly_approvals';

    protected $fillable = [
        'month',
        'year',
        'supervisor_id',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'month' => 'integer',
            'year' => 'integer',
            'approved_at' => 'datetime',
        ];
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }
}
