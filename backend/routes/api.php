<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\PatientController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware('api.auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::get('/doctors', [DoctorController::class, 'index']);
Route::get('/doctors/{doctor}/slots', [DoctorController::class, 'slots']);

Route::middleware('api.auth')->group(function () {
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store'])
        ->middleware('role:admin,staff,patient');
    Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])
        ->middleware('role:admin,staff,doctor');
    Route::delete('/appointments/{appointment}', [AppointmentController::class, 'destroy'])
        ->middleware('role:admin');

    Route::apiResource('/patients', PatientController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->middleware('role:admin,staff');

    Route::apiResource('/medicines', MedicineController::class)
        ->only(['index', 'store', 'update'])
        ->middleware('role:admin,staff');
});
