<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $query = Patient::query()->latest();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($inner) use ($search) {
                $inner->where('full_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('patient_no', 'like', "%{$search}%");
            });
        }

        return response()->json(['patients' => $query->limit(100)->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
            'blood_type' => ['nullable', 'string', 'max:20'],
            'allergies' => ['nullable', 'string', 'max:1000'],
            'emergency_contact' => ['nullable', 'string', 'max:255'],
        ]);

        $patient = Patient::create($data + [
            'patient_no' => sprintf('PT-%s-%05d', now()->format('Y'), Patient::withTrashed()->count() + 1),
        ]);

        return response()->json(['patient' => $patient], 201);
    }

    public function update(Request $request, Patient $patient)
    {
        $data = $request->validate([
            'full_name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
            'blood_type' => ['nullable', 'string', 'max:20'],
            'allergies' => ['nullable', 'string', 'max:1000'],
            'emergency_contact' => ['nullable', 'string', 'max:255'],
        ]);

        $patient->update($data);

        return response()->json(['patient' => $patient]);
    }
}
