<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:30'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'role' => 'patient',
            'password' => $data['password'],
        ]);

        Patient::create([
            'user_id' => $user->id,
            'patient_no' => $this->nextCode('PT', Patient::count() + 1),
            'full_name' => $data['name'],
            'phone' => $data['phone'],
            'email' => $data['email'],
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'gender' => $data['gender'] ?? null,
            'address' => $data['address'] ?? null,
        ]);

        return $this->issueToken($user, 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'role' => ['nullable', 'in:admin,doctor,staff,patient'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password) || ! $user->is_active) {
            return response()->json(['message' => 'Invalid login details.'], 422);
        }

        if (! empty($data['role']) && $user->role !== $data['role']) {
            return response()->json(['message' => 'This account cannot access the selected panel.'], 403);
        }

        return $this->issueToken($user);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load(['patient', 'doctor', 'staff']),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->forceFill(['api_token_hash' => null])->save();

        return response()->json(['message' => 'Logged out.']);
    }

    private function issueToken(User $user, int $status = 200)
    {
        $token = bin2hex(random_bytes(32));
        $user->forceFill(['api_token_hash' => hash('sha256', $token)])->save();

        return response()->json([
            'token' => $token,
            'user' => $user->fresh()->load(['patient', 'doctor', 'staff']),
        ], $status);
    }

    private function nextCode(string $prefix, int $number): string
    {
        return sprintf('%s-%s-%05d', $prefix, now()->format('Y'), $number);
    }
}
