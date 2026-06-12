<?php

namespace App\Models\Ipal;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class IpalProcessValueAttachment extends Model
{
    use HasFactory;

    protected $table = 'ipal_process_value_attachments';

    protected $fillable = [
        'process_value_id',
        'file_path',
        'original_name',
    ];

    public function processValue(): BelongsTo
    {
        return $this->belongsTo(IpalProcessValue::class, 'process_value_id');
    }

    public function getUrl(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }
}
