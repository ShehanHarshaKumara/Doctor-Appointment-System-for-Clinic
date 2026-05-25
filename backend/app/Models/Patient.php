<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Patient extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'patient_no',
        'full_name',
        'phone',
        'email',
        'date_of_birth',
        'gender',
        'address',
        'blood_type',
        'allergies',
        'emergency_contact',
        'profile_image_path',
    ];

    protected $appends = [
        'profile_image_url',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function documents()
    {
        return $this->hasMany(PatientDocument::class)->latest();
    }

    public function getProfileImageUrlAttribute(): ?string
    {
        return $this->profile_image_path ? Storage::disk('public')->url($this->profile_image_path) : null;
    }
}
