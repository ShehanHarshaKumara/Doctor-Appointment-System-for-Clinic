<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('patient_no')->unique();
            $table->string('full_name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender')->nullable();
            $table->string('address')->nullable();
            $table->string('blood_type')->nullable();
            $table->text('allergies')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('doctor_no')->unique();
            $table->string('full_name');
            $table->string('specialization');
            $table->string('phone')->nullable();
            $table->string('qualification')->nullable();
            $table->text('bio')->nullable();
            $table->json('availability')->nullable();
            $table->decimal('channel_fee', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('staff_no')->unique();
            $table->string('full_name');
            $table->string('position')->default('Receptionist');
            $table->json('permissions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('appointment_no')->unique();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('appointment_date');
            $table->string('time_slot');
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show'])->default('pending');
            $table->text('doctor_notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['doctor_id', 'appointment_date', 'time_slot', 'deleted_at'], 'appointments_doctor_slot_unique');
        });

        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->string('medicine_no')->unique();
            $table->string('name');
            $table->string('generic_name')->nullable();
            $table->string('category')->nullable();
            $table->string('dosage_form')->nullable();
            $table->integer('stock_qty')->default(0);
            $table->integer('low_stock_threshold')->default(10);
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->date('expiry_date')->nullable();
            $table->string('supplier')->nullable();
            $table->enum('status', ['active', 'low_stock', 'expired', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('health_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->decimal('value', 10, 2);
            $table->string('unit')->nullable();
            $table->timestamp('recorded_at');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('symptoms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->unsignedTinyInteger('severity')->default(1);
            $table->date('onset_date')->nullable();
            $table->string('current_status')->default('active');
            $table->timestamps();
        });

        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->text('diagnosis')->nullable();
            $table->json('medicines')->nullable();
            $table->text('instructions')->nullable();
            $table->date('next_visit_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
        Schema::dropIfExists('symptoms');
        Schema::dropIfExists('health_logs');
        Schema::dropIfExists('medicines');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('staff');
        Schema::dropIfExists('doctors');
        Schema::dropIfExists('patients');
    }
};
