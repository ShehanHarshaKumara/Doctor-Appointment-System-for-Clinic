<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class PatientDocument extends Model
{
    protected $fillable = [
        'patient_id',
        'name',
        'path',
        'mime_type',
        'size',
    ];

    protected $appends = [
        'url',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function getUrlAttribute(): ?string
    {
        return $this->path ? Storage::disk('public')->url($this->path) : null;
    }
}
