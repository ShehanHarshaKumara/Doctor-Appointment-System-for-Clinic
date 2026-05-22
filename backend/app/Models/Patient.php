<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}
