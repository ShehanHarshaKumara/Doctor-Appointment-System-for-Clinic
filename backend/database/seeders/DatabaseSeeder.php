<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Medicine;
use App\Models\Patient;
use App\Models\Staff;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $slots = [
            'monday' => ['09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00'],
            'tuesday' => ['09:00', '09:30', '11:00', '11:30', '15:00', '15:30'],
            'wednesday' => ['09:00', '09:30', '10:00', '10:30', '14:00', '14:30'],
            'thursday' => ['09:00', '10:00', '11:00', '14:00', '15:00'],
            'friday' => ['09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00'],
            'saturday' => ['09:00', '09:30', '10:00', '10:30'],
        ];

        $admin = User::create([
            'name' => 'Clinic Admin',
            'email' => 'admin@clinic.test',
            'phone' => '0771000001',
            'role' => 'admin',
            'password' => 'password123',
        ]);

        $staffUser = User::create([
            'name' => 'Reception Staff',
            'email' => 'staff@clinic.test',
            'phone' => '0771000002',
            'role' => 'staff',
            'password' => 'password123',
        ]);

        Staff::create([
            'user_id' => $staffUser->id,
            'staff_no' => 'ST-2026-0001',
            'full_name' => 'Reception Staff',
            'position' => 'Receptionist',
            'permissions' => ['patients', 'appointments', 'medicines'],
        ]);

        $doctorUsers = [
            ['Dr. Sarah Johnson', 'doctor@clinic.test', 'Cardiology', 150],
            ['Dr. Michael Chen', 'neuro@clinic.test', 'Neurology', 180],
            ['Dr. Priya Patel', 'derma@clinic.test', 'Dermatology', 140],
        ];

        $doctors = collect($doctorUsers)->map(function ($doctor, $index) use ($slots) {
            $user = User::create([
                'name' => $doctor[0],
                'email' => $doctor[1],
                'phone' => '077200000'.($index + 1),
                'role' => 'doctor',
                'password' => 'password123',
            ]);

            return Doctor::create([
                'user_id' => $user->id,
                'doctor_no' => sprintf('DR-2026-%04d', $index + 1),
                'full_name' => $doctor[0],
                'specialization' => $doctor[2],
                'phone' => $user->phone,
                'qualification' => 'MBBS, MD',
                'bio' => 'Experienced specialist focused on practical, patient-friendly care.',
                'availability' => $slots,
                'channel_fee' => $doctor[3],
            ]);
        });

        $patientUser = User::create([
            'name' => 'Demo Patient',
            'email' => 'patient@clinic.test',
            'phone' => '0773000001',
            'role' => 'patient',
            'password' => 'password123',
        ]);

        $patient = Patient::create([
            'user_id' => $patientUser->id,
            'patient_no' => 'PT-2026-00001',
            'full_name' => 'Demo Patient',
            'phone' => $patientUser->phone,
            'email' => $patientUser->email,
            'date_of_birth' => '1995-05-12',
            'gender' => 'Female',
            'address' => 'Colombo',
            'blood_type' => 'O+',
            'allergies' => 'None recorded',
            'emergency_contact' => '0773999999',
        ]);

        $walkIn = Patient::create([
            'patient_no' => 'PT-2026-00002',
            'full_name' => 'Walk-in Patient',
            'phone' => '0773000002',
            'email' => 'walkin@example.test',
            'gender' => 'Male',
            'address' => 'Kandy',
        ]);

        Appointment::create([
            'appointment_no' => 'APT-'.now()->format('Ymd').'-0001',
            'patient_id' => $patient->id,
            'doctor_id' => $doctors[0]->id,
            'booked_by' => $patientUser->id,
            'appointment_date' => now()->toDateString(),
            'time_slot' => '09:00',
            'reason' => 'Chest discomfort follow-up',
            'status' => 'pending',
        ]);

        Appointment::create([
            'appointment_no' => 'APT-'.now()->addDay()->format('Ymd').'-0001',
            'patient_id' => $walkIn->id,
            'doctor_id' => $doctors[1]->id,
            'booked_by' => $staffUser->id,
            'appointment_date' => now()->addDay()->toDateString(),
            'time_slot' => '09:30',
            'reason' => 'Headache and dizziness',
            'status' => 'confirmed',
        ]);

        Medicine::insert([
            [
                'medicine_no' => 'MED-2026-0001',
                'name' => 'Paracetamol',
                'generic_name' => 'Acetaminophen',
                'category' => 'Pain relief',
                'dosage_form' => 'Tablet',
                'stock_qty' => 120,
                'low_stock_threshold' => 20,
                'unit_price' => 8.50,
                'expiry_date' => now()->addMonths(8)->toDateString(),
                'supplier' => 'MediSupply Lanka',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'medicine_no' => 'MED-2026-0002',
                'name' => 'Amoxicillin',
                'generic_name' => 'Amoxicillin',
                'category' => 'Antibiotic',
                'dosage_form' => 'Capsule',
                'stock_qty' => 8,
                'low_stock_threshold' => 15,
                'unit_price' => 22.00,
                'expiry_date' => now()->addMonths(4)->toDateString(),
                'supplier' => 'CarePharma',
                'status' => 'low_stock',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
