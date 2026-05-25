<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
        $data = $request->validate($this->rules());

        $patient = Patient::create(collect($data)->except(['profile_image', 'documents'])->all() + [
            'patient_no' => sprintf('PT-%s-%05d', now()->format('Y'), Patient::withTrashed()->count() + 1),
        ]);
        $this->storeMedia($request, $patient);

        return response()->json(['patient' => $patient->fresh()->load('documents')], 201);
    }

    public function update(Request $request, Patient $patient)
    {
        $data = $request->validate($this->rules(false));

        $patient->update(collect($data)->except(['profile_image', 'documents'])->all());
        $this->storeMedia($request, $patient);

        return response()->json(['patient' => $patient->fresh()->load('documents')]);
    }

    public function show(Patient $patient)
    {
        $appointments = $patient->appointments()
            ->with('doctor:id,full_name,specialization')
            ->latest('appointment_date')
            ->latest('time_slot')
            ->limit(20)
            ->get();

        return response()->json([
            'patient' => $patient->load('documents'),
            'report' => [
                'total_appointments' => $patient->appointments()->count(),
                'upcoming_appointments' => $patient->appointments()
                    ->whereDate('appointment_date', '>=', today())
                    ->whereNotIn('status', ['completed', 'cancelled', 'no_show'])
                    ->count(),
                'completed_appointments' => $patient->appointments()->where('status', 'completed')->count(),
                'recent_appointments' => $appointments,
            ],
        ]);
    }

    public function destroy(Patient $patient)
    {
        if ($patient->profile_image_path) {
            Storage::disk('public')->delete($patient->profile_image_path);
        }

        Storage::disk('public')->delete($patient->documents()->pluck('path')->all());
        $patient->documents()->delete();
        $patient->delete();

        return response()->json(['message' => 'Patient deleted.']);
    }

    private function rules(bool $requiredIdentity = true): array
    {
        return [
            'full_name' => [$requiredIdentity ? 'required' : 'sometimes', 'string', 'max:255'],
            'phone' => [$requiredIdentity ? 'required' : 'sometimes', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
            'blood_type' => ['nullable', 'string', 'max:20'],
            'allergies' => ['nullable', 'string', 'max:1000'],
            'emergency_contact' => ['nullable', 'string', 'max:255'],
            'profile_image' => ['nullable', 'image', 'max:4096'],
            'documents' => ['nullable', 'array', 'max:5'],
            'documents.*' => ['file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:10240'],
        ];
    }

    private function storeMedia(Request $request, Patient $patient): void
    {
        if ($request->hasFile('profile_image')) {
            if ($patient->profile_image_path) {
                Storage::disk('public')->delete($patient->profile_image_path);
            }

            $patient->forceFill([
                'profile_image_path' => $request->file('profile_image')->store('patients/profile-images', 'public'),
            ])->save();
        }

        foreach ($request->file('documents', []) as $document) {
            $patient->documents()->create([
                'name' => $document->getClientOriginalName(),
                'path' => $document->store('patients/documents', 'public'),
                'mime_type' => $document->getMimeType(),
                'size' => $document->getSize(),
            ]);
        }
    }
}
