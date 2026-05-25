<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

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

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());

        $doctor = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['full_name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'role' => 'doctor',
                'password' => $data['password'],
            ]);

            return Doctor::create([
                'user_id' => $user->id,
                'doctor_no' => sprintf('DR-%s-%04d', now()->format('Y'), Doctor::withTrashed()->count() + 1),
                'full_name' => $data['full_name'],
                'specialization' => $data['specialization'],
                'phone' => $data['phone'] ?? null,
                'qualification' => $data['qualification'] ?? null,
                'bio' => $data['bio'] ?? null,
                'availability' => [],
                'channel_fee' => $data['channel_fee'] ?? 0,
            ]);
        });

        return response()->json([
            'doctor' => $doctor->load('user:id,name,email,phone,role,is_active'),
        ], 201);
    }

    public function show(Doctor $doctor)
    {
        return response()->json([
            'doctor' => $doctor->load('user:id,name,email,phone,role,is_active'),
        ]);
    }

    public function update(Request $request, Doctor $doctor)
    {
        $data = $request->validate($this->rules(false, $doctor));

        DB::transaction(function () use ($data, $doctor) {
            $doctor->update([
                'full_name' => $data['full_name'] ?? $doctor->full_name,
                'specialization' => $data['specialization'] ?? $doctor->specialization,
                'phone' => array_key_exists('phone', $data) ? $data['phone'] : $doctor->phone,
                'qualification' => array_key_exists('qualification', $data) ? $data['qualification'] : $doctor->qualification,
                'bio' => array_key_exists('bio', $data) ? $data['bio'] : $doctor->bio,
                'channel_fee' => $data['channel_fee'] ?? $doctor->channel_fee,
            ]);

            if ($doctor->user) {
                $userData = [
                    'name' => $doctor->full_name,
                    'phone' => $doctor->phone,
                ];

                if (array_key_exists('email', $data)) {
                    $userData['email'] = $data['email'];
                }

                if (! empty($data['password'])) {
                    $userData['password'] = $data['password'];
                }

                $doctor->user->update($userData);
            }
        });

        return response()->json([
            'doctor' => $doctor->fresh()->load('user:id,name,email,phone,role,is_active'),
        ]);
    }

    public function destroy(Doctor $doctor)
    {
        DB::transaction(function () use ($doctor) {
            $doctor->update(['is_active' => false]);
            $doctor->user?->forceFill([
                'is_active' => false,
                'api_token_hash' => null,
            ])->save();
            $doctor->delete();
        });

        return response()->json(['message' => 'Doctor deleted.']);
    }

    private function rules(bool $creating = true, ?Doctor $doctor = null): array
    {
        $identity = $creating ? 'required' : 'sometimes';
        $emailRule = Rule::unique('users', 'email');

        if ($doctor?->user_id) {
            $emailRule->ignore($doctor->user_id);
        }

        return [
            'full_name' => [$identity, 'string', 'max:255'],
            'email' => [$identity, 'email', 'max:255', $emailRule],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => [$creating ? 'required' : 'nullable', 'confirmed', Password::min(8)],
            'specialization' => [$identity, 'string', 'max:255'],
            'qualification' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'channel_fee' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
