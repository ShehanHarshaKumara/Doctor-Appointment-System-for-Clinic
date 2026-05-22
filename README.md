
# Clinic Appointment Management System

Full-stack MVP for the clinic appointment system described in the project document. The app uses a Laravel/PHP backend with MySQL/MariaDB and a Vite React frontend.

## Demo Accounts

All seeded users use password `password123`.

- Patient: `patient@clinic.test`
- Staff: `staff@clinic.test`
- Doctor: `doctor@clinic.test`
- Admin: `admin@clinic.test`

## Backend Setup

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

Create the XAMPP MySQL/MariaDB database before running Laravel migrations:

```bash
C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS clinic_appointment_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Then build the database tables and demo data:

```bash
cd backend
php artisan migrate:fresh --seed
php artisan serve
```

The backend `.env` expects XAMPP MySQL/MariaDB with database `clinic_appointment_system`, user `root`, and an empty local password.

## Frontend Setup

```bash
npm install
copy .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL=http://127.0.0.1:8000/api` if your Laravel API runs on a different URL.

## Verification

```bash
cd backend
php artisan test

cd ..
npm run build
```
  
