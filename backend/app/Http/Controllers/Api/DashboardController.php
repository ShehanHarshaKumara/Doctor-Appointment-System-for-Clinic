<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Medicine;
use App\Models\Patient;
use App\Models\Staff;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function summary(Request $request)
    {
        $user = $request->user();
        $appointmentQuery = Appointment::query();

        if ($user->role === 'patient') {
            $appointmentQuery->where('patient_id', $user->patient?->id ?? 0);
        }

        if ($user->role === 'doctor') {
            $appointmentQuery->where('doctor_id', $user->doctor?->id ?? 0);
        }

        return response()->json([
            'summary' => [
                'total_patients' => Patient::count(),
                'total_doctors' => Doctor::count(),
                'total_staff' => Staff::count(),
                'today_appointments' => (clone $appointmentQuery)->whereDate('appointment_date', today())->count(),
                'pending_appointments' => (clone $appointmentQuery)->where('status', 'pending')->count(),
                'completed_appointments' => (clone $appointmentQuery)->where('status', 'completed')->count(),
                'low_stock_medicines' => Medicine::where('status', 'low_stock')->count(),
            ],
        ]);
    }
}
