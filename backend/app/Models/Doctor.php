<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Doctor extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'doctor_no',
        'full_name',
        'specialization',
        'phone',
        'qualification',
        'bio',
        'availability',
        'channel_fee',
        'is_active',
    ];

    protected $casts = [
        'availability' => 'array',
        'channel_fee' => 'decimal:2',
        'is_active' => 'boolean',
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
