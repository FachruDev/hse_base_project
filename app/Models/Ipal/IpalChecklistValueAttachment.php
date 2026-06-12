<?php

namespace App\Models\Ipal;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class IpalChecklistValueAttachment extends Model
{
    use HasFactory;

    protected $table = 'ipal_checklist_value_attachments';

    protected $fillable = [
        'checklist_value_id',
        'file_path',
        'original_name',
    ];

    public function checklistValue(): BelongsTo
    {
        return $this->belongsTo(IpalChecklistValue::class, 'checklist_value_id');
    }

    public function getUrl(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }
}
