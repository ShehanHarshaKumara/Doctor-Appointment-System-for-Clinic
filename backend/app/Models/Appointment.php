<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use SoftDeletes;

    public const STATUSES = ['pending', 'confirmed', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show'];

    protected $fillable = [
        'appointment_no',
        'patient_id',
        'doctor_id',
        'booked_by',
        'appointment_date',
        'time_slot',
        'reason',
        'status',
        'doctor_notes',
        'completed_at',
    ];

    protected $casts = [
        'appointment_date' => 'date:Y-m-d',
        'completed_at' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function bookedBy()
    {
        return $this->belongsTo(User::class, 'booked_by');
    }
}
