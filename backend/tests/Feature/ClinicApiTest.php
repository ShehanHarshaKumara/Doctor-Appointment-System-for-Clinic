<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClinicApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_demo_users_can_login_to_their_panels(): void
    {
        foreach ([
            ['email' => 'admin@clinic.test', 'role' => 'admin'],
            ['email' => 'staff@clinic.test', 'role' => 'staff'],
            ['email' => 'doctor@clinic.test', 'role' => 'doctor'],
            ['email' => 'patient@clinic.test', 'role' => 'patient'],
        ] as $account) {
            $this->postJson('/api/auth/login', [
                'email' => $account['email'],
                'password' => 'password123',
                'role' => $account['role'],
            ])->assertOk()
                ->assertJsonStructure(['token', 'user' => ['id', 'role']]);
        }
    }

    public function test_appointment_booking_generates_number_and_blocks_duplicate_slots(): void
    {
        $patient = $this->loginAs('patient@clinic.test', 'patient');
        $doctor = Doctor::firstOrFail();

        $payload = [
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addWeek()->next('Monday')->toDateString(),
            'time_slot' => '09:30',
            'reason' => 'Routine check',
        ];

        $this->withToken($patient)
            ->postJson('/api/appointments', $payload)
            ->assertCreated()
            ->assertJsonPath('appointment.status', 'pending')
            ->assertJson(fn ($json) => $json->whereType('appointment.appointment_no', 'string')->etc());

        $this->withToken($patient)
            ->postJson('/api/appointments', $payload)
            ->assertStatus(409);
    }

    public function test_role_middleware_blocks_patient_from_staff_patient_listing(): void
    {
        $patient = $this->loginAs('patient@clinic.test', 'patient');

        $this->withToken($patient)
            ->getJson('/api/patients')
            ->assertForbidden();
    }

    public function test_doctor_can_only_update_own_appointment(): void
    {
        $doctorToken = $this->loginAs('doctor@clinic.test', 'doctor');
        $otherDoctor = User::where('email', 'neuro@clinic.test')->firstOrFail()->doctor;

        $appointment = Appointment::create([
            'appointment_no' => 'APT-'.now()->addDays(3)->format('Ymd').'-0099',
            'patient_id' => Patient::firstOrFail()->id,
            'doctor_id' => $otherDoctor->id,
            'booked_by' => User::where('email', 'staff@clinic.test')->firstOrFail()->id,
            'appointment_date' => now()->addDays(3)->toDateString(),
            'time_slot' => '10:00',
            'reason' => 'Doctor ownership test',
            'status' => 'confirmed',
        ]);

        $this->withToken($doctorToken)
            ->patchJson("/api/appointments/{$appointment->id}/status", ['status' => 'completed'])
            ->assertForbidden();
    }

    private function loginAs(string $email, string $role): string
    {
        return $this->postJson('/api/auth/login', [
            'email' => $email,
            'password' => 'password123',
            'role' => $role,
        ])->json('token');
    }
}
