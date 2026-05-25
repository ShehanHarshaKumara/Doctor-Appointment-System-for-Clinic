<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Medicine;
use App\Models\Patient;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

    public function test_admin_can_list_users_without_password_values(): void
    {
        $admin = $this->loginAs('admin@clinic.test', 'admin');

        $this->withToken($admin)
            ->getJson('/api/users')
            ->assertOk()
            ->assertJsonStructure(['users' => [['id', 'name', 'email', 'role', 'is_active']]])
            ->assertJsonMissingPath('users.0.password')
            ->assertJsonMissingPath('users.0.api_token_hash');
    }

    public function test_admin_can_update_profile_email_password_and_image(): void
    {
        Storage::fake('public');
        $admin = $this->loginAs('admin@clinic.test', 'admin');

        $response = $this->withToken($admin)
            ->post('/api/auth/profile', [
                'name' => 'Updated Clinic Admin',
                'email' => 'admin.updated@clinic.test',
                'phone' => '0771000099',
                'current_password' => 'password123',
                'password' => 'newadminpass123',
                'password_confirmation' => 'newadminpass123',
                'profile_image' => UploadedFile::fake()->createWithContent(
                    'admin.png',
                    base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aL0AAAAASUVORK5CYII=')
                ),
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('user.name', 'Updated Clinic Admin')
            ->assertJsonPath('user.email', 'admin.updated@clinic.test')
            ->assertJsonStructure(['user' => ['profile_image_url']])
            ->assertJsonMissingPath('user.password')
            ->assertJsonMissingPath('user.profile_image_path');

        $updatedUser = User::findOrFail($response->json('user.id'));
        Storage::disk('public')->assertExists($updatedUser->profile_image_path);

        $this->postJson('/api/auth/login', [
            'email' => 'admin.updated@clinic.test',
            'password' => 'newadminpass123',
            'role' => 'admin',
        ])->assertOk();
    }

    public function test_admin_can_manage_patient_details_and_report(): void
    {
        Storage::fake('public');
        $admin = $this->loginAs('admin@clinic.test', 'admin');

        $patient = $this->withToken($admin)
            ->post('/api/patients', [
                'full_name' => 'Report Patient',
                'phone' => '0774555000',
                'email' => 'report@example.test',
                'blood_type' => 'A+',
                'profile_image' => UploadedFile::fake()->createWithContent(
                    'profile.png',
                    base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aL0AAAAASUVORK5CYII=')
                ),
                'documents' => [UploadedFile::fake()->create('lab-report.pdf', 24, 'application/pdf')],
            ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonStructure(['patient' => ['profile_image_url', 'documents' => [['name', 'url']]]])
            ->json('patient');

        $this->withToken($admin)
            ->getJson("/api/patients/{$patient['id']}")
            ->assertOk()
            ->assertJsonPath('patient.full_name', 'Report Patient')
            ->assertJsonPath('patient.documents.0.name', 'lab-report.pdf')
            ->assertJsonStructure(['report' => ['total_appointments', 'upcoming_appointments', 'completed_appointments', 'recent_appointments']]);

        $this->withToken($admin)
            ->patchJson("/api/patients/{$patient['id']}", [
                'address' => 'Galle',
                'allergies' => 'Penicillin',
            ])
            ->assertOk()
            ->assertJsonPath('patient.address', 'Galle');

        $this->withToken($admin)
            ->deleteJson("/api/patients/{$patient['id']}")
            ->assertOk();
    }

    public function test_admin_can_create_doctor_account_with_hashed_password_login(): void
    {
        $admin = $this->loginAs('admin@clinic.test', 'admin');

        $response = $this->withToken($admin)
            ->postJson('/api/doctors', [
                'full_name' => 'Dr. Account Creator',
                'email' => 'created.doctor@example.test',
                'phone' => '0774555333',
                'password' => 'doctorpass123',
                'password_confirmation' => 'doctorpass123',
                'specialization' => 'Family Medicine',
                'qualification' => 'MBBS',
                'channel_fee' => 175,
            ])
            ->assertCreated()
            ->assertJsonPath('doctor.full_name', 'Dr. Account Creator')
            ->assertJsonPath('doctor.user.email', 'created.doctor@example.test')
            ->assertJsonMissingPath('doctor.user.password');

        $doctor = Doctor::findOrFail($response->json('doctor.id'));
        $user = $doctor->user;

        $this->assertSame('doctor', $user->role);
        $this->assertNotSame('doctorpass123', $user->password);

        $this->postJson('/api/auth/login', [
            'email' => 'created.doctor@example.test',
            'password' => 'doctorpass123',
            'role' => 'doctor',
        ])->assertOk();
    }

    public function test_admin_can_view_update_and_delete_doctor_account(): void
    {
        $admin = $this->loginAs('admin@clinic.test', 'admin');
        $doctor = Doctor::firstOrFail();
        $doctorEmail = $doctor->user->email;

        $this->withToken($admin)
            ->getJson("/api/doctors/{$doctor->id}")
            ->assertOk()
            ->assertJsonPath('doctor.user.email', $doctorEmail);

        $this->withToken($admin)
            ->patchJson("/api/doctors/{$doctor->id}", [
                'full_name' => 'Dr. Updated Name',
                'email' => 'updated.doctor@example.test',
                'phone' => '0774999000',
                'specialization' => 'Internal Medicine',
                'qualification' => 'MBBS, MD',
                'channel_fee' => 230,
                'password' => 'updatedpass123',
                'password_confirmation' => 'updatedpass123',
            ])
            ->assertOk()
            ->assertJsonPath('doctor.full_name', 'Dr. Updated Name')
            ->assertJsonPath('doctor.user.email', 'updated.doctor@example.test');

        $this->withToken($admin)
            ->patchJson("/api/doctors/{$doctor->id}", [
                'full_name' => 'Dr. Updated Name',
                'email' => 'updated.doctor@example.test',
                'phone' => '0774999000',
                'specialization' => 'Internal Medicine',
                'qualification' => 'MBBS, MD',
                'channel_fee' => 240,
            ])
            ->assertOk()
            ->assertJsonPath('doctor.channel_fee', '240.00');

        $this->postJson('/api/auth/login', [
            'email' => 'updated.doctor@example.test',
            'password' => 'updatedpass123',
            'role' => 'doctor',
        ])->assertOk();

        $this->withToken($admin)
            ->deleteJson("/api/doctors/{$doctor->id}")
            ->assertOk();

        $this->assertSoftDeleted($doctor);
        $this->assertFalse($doctor->user->fresh()->is_active);
    }

    public function test_admin_can_manage_staff_accounts(): void
    {
        $admin = $this->loginAs('admin@clinic.test', 'admin');

        $staff = $this->withToken($admin)
            ->postJson('/api/staff', [
                'full_name' => 'New Front Desk',
                'email' => 'frontdesk@example.test',
                'phone' => '0774555444',
                'position' => 'Front Desk Officer',
                'permissions' => ['patients', 'appointments'],
                'password' => 'staffpass123',
                'password_confirmation' => 'staffpass123',
            ])
            ->assertCreated()
            ->assertJsonPath('staff.user.email', 'frontdesk@example.test')
            ->json('staff');

        $this->withToken($admin)
            ->getJson("/api/staff/{$staff['id']}")
            ->assertOk()
            ->assertJsonPath('staff.position', 'Front Desk Officer');

        $this->withToken($admin)
            ->patchJson("/api/staff/{$staff['id']}", [
                'full_name' => 'Updated Front Desk',
                'email' => 'frontdesk.updated@example.test',
                'phone' => '0774555445',
                'position' => 'Reception Lead',
                'permissions' => ['patients', 'appointments', 'medicines'],
            ])
            ->assertOk()
            ->assertJsonPath('staff.position', 'Reception Lead');

        $this->postJson('/api/auth/login', [
            'email' => 'frontdesk.updated@example.test',
            'password' => 'staffpass123',
            'role' => 'staff',
        ])->assertOk();

        $this->withToken($admin)
            ->deleteJson("/api/staff/{$staff['id']}")
            ->assertOk();

        $this->assertSoftDeleted(Staff::withTrashed()->findOrFail($staff['id']));
        $this->assertFalse(User::where('email', 'frontdesk.updated@example.test')->firstOrFail()->is_active);
    }

    public function test_admin_can_manage_medicine_inventory(): void
    {
        $admin = $this->loginAs('admin@clinic.test', 'admin');

        $medicine = $this->withToken($admin)
            ->postJson('/api/medicines', [
                'name' => 'Clinic Test Tablet',
                'generic_name' => 'Paracetamol',
                'category' => 'Pain Relief',
                'dosage_form' => 'Tablet',
                'stock_qty' => 40,
                'low_stock_threshold' => 12,
                'unit_price' => 15.5,
                'expiry_date' => now()->addYear()->toDateString(),
                'supplier' => 'Clinic Supplier',
            ])
            ->assertCreated()
            ->assertJsonPath('medicine.name', 'Clinic Test Tablet')
            ->assertJsonPath('medicine.status', 'active')
            ->json('medicine');

        $this->withToken($admin)
            ->getJson("/api/medicines/{$medicine['id']}")
            ->assertOk()
            ->assertJsonPath('medicine.generic_name', 'Paracetamol');

        $this->withToken($admin)
            ->patchJson("/api/medicines/{$medicine['id']}", [
                'stock_qty' => 3,
                'low_stock_threshold' => 12,
            ])
            ->assertOk()
            ->assertJsonPath('medicine.status', 'low_stock');

        $this->withToken($admin)
            ->getJson('/api/medicines?search=Clinic%20Test')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Clinic Test Tablet']);

        $this->withToken($admin)
            ->deleteJson("/api/medicines/{$medicine['id']}")
            ->assertNoContent();

        $this->assertSoftDeleted(Medicine::withTrashed()->findOrFail($medicine['id']));
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
