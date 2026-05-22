<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::with(['patient', 'doctor', 'bookedBy'])->latest('appointment_date')->latest('time_slot');

        if ($request->user()->role === 'patient') {
            $query->where('patient_id', $request->user()->patient?->id ?? 0);
        }

        if ($request->user()->role === 'doctor') {
            $query->where('doctor_id', $request->user()->doctor?->id ?? 0);
        }

        foreach (['doctor_id', 'patient_id', 'status'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }

        if ($request->filled('date')) {
            $query->whereDate('appointment_date', $request->input('date'));
        }

        return response()->json(['appointments' => $query->limit(100)->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id' => ['nullable', 'exists:patients,id'],
            'patient' => ['nullable', 'array'],
            'patient.full_name' => ['nullable', 'string', 'max:255'],
            'patient.phone' => ['nullable', 'string', 'max:30'],
            'patient.email' => ['nullable', 'email', 'max:255'],
            'doctor_id' => ['required', 'exists:doctors,id'],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'time_slot' => ['required', 'string', 'max:20'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = $request->user();

        if ($user->role === 'patient') {
            $patient = $user->patient;
            if (! $patient) {
                return response()->json(['message' => 'Patient profile is missing.'], 422);
            }
        } elseif (! empty($data['patient_id'])) {
            $patient = Patient::findOrFail($data['patient_id']);
        } else {
            validator($data, [
                'patient.full_name' => ['required', 'string', 'max:255'],
                'patient.phone' => ['required', 'string', 'max:30'],
            ])->validate();

            $patient = Patient::create([
                'patient_no' => $this->nextPatientNo(),
                'full_name' => $data['patient']['full_name'],
                'phone' => $data['patient']['phone'],
                'email' => $data['patient']['email'] ?? null,
            ]);
        }

        $doctor = Doctor::findOrFail($data['doctor_id']);
        $this->ensureSlotIsValid($doctor, $data['appointment_date'], $data['time_slot']);

        $appointment = DB::transaction(function () use ($data, $doctor, $patient, $user) {
            $exists = Appointment::where('doctor_id', $doctor->id)
                ->whereDate('appointment_date', $data['appointment_date'])
                ->where('time_slot', $data['time_slot'])
                ->whereNotIn('status', ['cancelled', 'no_show'])
                ->lockForUpdate()
                ->exists();

            if ($exists) {
                abort(response()->json(['message' => 'This doctor time slot is already booked.'], 409));
            }

            return Appointment::create([
                'appointment_no' => $this->nextAppointmentNo($data['appointment_date']),
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'booked_by' => $user->id,
                'appointment_date' => $data['appointment_date'],
                'time_slot' => $data['time_slot'],
                'reason' => $data['reason'] ?? null,
                'status' => $user->role === 'patient' ? 'pending' : 'confirmed',
            ]);
        });

        return response()->json([
            'appointment' => $appointment->load(['patient', 'doctor', 'bookedBy']),
        ], 201);
    }

    public function updateStatus(Request $request, Appointment $appointment)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(Appointment::STATUSES)],
            'doctor_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $user = $request->user();
        if ($user->role === 'doctor' && $appointment->doctor_id !== $user->doctor?->id) {
            return response()->json(['message' => 'Doctors can only update their own appointments.'], 403);
        }

        $appointment->fill([
            'status' => $data['status'],
            'doctor_notes' => $data['doctor_notes'] ?? $appointment->doctor_notes,
            'completed_at' => $data['status'] === 'completed' ? now() : $appointment->completed_at,
        ])->save();

        return response()->json(['appointment' => $appointment->load(['patient', 'doctor', 'bookedBy'])]);
    }

    private function ensureSlotIsValid(Doctor $doctor, string $date, string $slot): void
    {
        $dayKey = strtolower(Carbon::parse($date)->format('l'));
        $slots = $doctor->availability[$dayKey] ?? [];

        if (! in_array($slot, $slots, true)) {
            abort(response()->json(['message' => 'Selected time slot is not available for this doctor.'], 422));
        }
    }

    private function nextAppointmentNo(string $date): string
    {
        $prefix = 'APT-'.Carbon::parse($date)->format('Ymd');
        $count = Appointment::where('appointment_no', 'like', $prefix.'-%')->lockForUpdate()->count() + 1;

        return sprintf('%s-%04d', $prefix, $count);
    }

    private function nextPatientNo(): string
    {
        return sprintf('PT-%s-%05d', now()->format('Y'), Patient::withTrashed()->count() + 1);
    }
}
