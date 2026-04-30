<?php

namespace App\Models\Ipal;

use App\Models\Master\ChecklistTemplate;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IpalChecklist extends Model
{
    use HasFactory;

    protected $table = 'ipal_checklists';

    protected $fillable = [
        'log_id',
        'template_id',
    ];

    public function dailyLog(): BelongsTo
    {
        return $this->belongsTo(IpalDailyLog::class, 'log_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(ChecklistTemplate::class, 'template_id');
    }

    public function values(): HasMany
    {
        return $this->hasMany(IpalChecklistValue::class, 'checklist_id');
    }
}
