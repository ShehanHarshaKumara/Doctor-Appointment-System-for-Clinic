<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StaffController extends Controller
{
    public function index()
    {
        return response()->json([
            'staff' => Staff::with('user:id,name,email,phone,role,is_active')
                ->where('is_active', true)
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());

        $staff = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['full_name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'role' => 'staff',
                'password' => $data['password'],
            ]);

            return Staff::create([
                'user_id' => $user->id,
                'staff_no' => sprintf('ST-%s-%04d', now()->format('Y'), Staff::withTrashed()->count() + 1),
                'full_name' => $data['full_name'],
                'position' => $data['position'],
                'permissions' => $data['permissions'] ?? ['patients', 'appointments'],
            ]);
        });

        return response()->json([
            'staff' => $staff->load('user:id,name,email,phone,role,is_active'),
        ], 201);
    }

    public function show(Staff $staff)
    {
        return response()->json([
            'staff' => $staff->load('user:id,name,email,phone,role,is_active'),
        ]);
    }

    public function update(Request $request, Staff $staff)
    {
        $data = $request->validate($this->rules(false, $staff));

        DB::transaction(function () use ($data, $staff) {
            $staff->update([
                'full_name' => $data['full_name'] ?? $staff->full_name,
                'position' => $data['position'] ?? $staff->position,
                'permissions' => $data['permissions'] ?? $staff->permissions,
            ]);

            $userData = [
                'name' => $staff->full_name,
            ];

            if (array_key_exists('email', $data)) {
                $userData['email'] = $data['email'];
            }

            if (array_key_exists('phone', $data)) {
                $userData['phone'] = $data['phone'];
            }

            if (! empty($data['password'])) {
                $userData['password'] = $data['password'];
            }

            $staff->user->update($userData);
        });

        return response()->json([
            'staff' => $staff->fresh()->load('user:id,name,email,phone,role,is_active'),
        ]);
    }

    public function destroy(Staff $staff)
    {
        DB::transaction(function () use ($staff) {
            $staff->update(['is_active' => false]);
            $staff->user->forceFill([
                'is_active' => false,
                'api_token_hash' => null,
            ])->save();
            $staff->delete();
        });

        return response()->json(['message' => 'Staff deleted.']);
    }

    private function rules(bool $creating = true, ?Staff $staff = null): array
    {
        $identity = $creating ? 'required' : 'sometimes';
        $emailRule = Rule::unique('users', 'email');

        if ($staff?->user_id) {
            $emailRule->ignore($staff->user_id);
        }

        return [
            'full_name' => [$identity, 'string', 'max:255'],
            'email' => [$identity, 'email', 'max:255', $emailRule],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => [$creating ? 'required' : 'nullable', 'confirmed', Password::min(8)],
            'position' => [$identity, 'string', 'max:255'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::in(['patients', 'appointments', 'medicines'])],
        ];
    }
}
