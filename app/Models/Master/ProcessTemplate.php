<?php

namespace App\Models\Master;

use App\Models\Ipal\IpalProcessLog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProcessTemplate extends Model
{
    use HasFactory;

    protected $table = 'm_process_templates';

    protected $fillable = [
        'name',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function sections(): HasMany
    {
        return $this->hasMany(ProcessSection::class, 'template_id');
    }

    public function processLogs(): HasMany
    {
        return $this->hasMany(IpalProcessLog::class, 'template_id');
    }
}
