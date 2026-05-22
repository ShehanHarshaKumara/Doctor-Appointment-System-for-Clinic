<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index()
    {
        return response()->json([
            'doctors' => Doctor::where('is_active', true)
                ->orderBy('full_name')
                ->get(),
        ]);
    }

    public function slots(Request $request, Doctor $doctor)
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
        ]);

        $date = Carbon::parse($data['date']);
        $dayKey = strtolower($date->format('l'));
        $allSlots = $doctor->availability[$dayKey] ?? [];

        $bookedSlots = Appointment::where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', $date)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->pluck('time_slot')
            ->all();

        return response()->json([
            'date' => $date->toDateString(),
            'doctor' => $doctor,
            'slots' => collect($allSlots)->map(fn ($slot) => [
                'time' => $slot,
                'available' => ! in_array($slot, $bookedSlots, true),
            ])->values(),
        ]);
    }
}
