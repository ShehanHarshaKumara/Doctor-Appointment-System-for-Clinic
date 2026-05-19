# Doctor Appointment System for Clinic

## 1. Project Title

**Doctor Appointment Management System for Clinic**

## 2. Introduction

The Doctor Appointment Management System is a web-based system designed for clinics to manage patient appointments, doctor channeling, patient medical details, medicine records, staff activities, and administrative tasks. This system helps reduce manual work, avoid booking conflicts, improve patient service, and keep clinic records organized.

The system includes three main panels:

1. **Staff Panel**
2. **Patient Panel**
3. **Admin / Doctor Panel**

Each panel has a separate login and role-based access control.

---

## 3. Problem Statement

Many clinics still manage patient details, doctor appointments, medicines, and medical records manually. This can cause problems such as duplicate bookings, missing patient records, wrong appointment numbers, difficulty tracking patient history, and slow service.

This system provides a digital solution for managing clinic operations efficiently.

---

## 4. Main Objectives

* Manage patient details digitally.
* Allow patients to book doctor appointments online.
* Allow staff members to manage patients, medicines, and channel bookings.
* Generate appointment numbers automatically.
* Allow doctors/admins to view patient history and appointment details.
* Track patient health progress and sickness updates.
* Provide secure login for staff, patients, doctors, and admins.
* Improve clinic service quality and reduce paperwork.

---

## 5. User Roles

### 5.1 Admin / Doctor

Admin or doctor has the highest access in the system. They can manage doctors, staff, patients, appointments, medicine records, and reports.

### 5.2 Staff Member

Staff members manage daily clinic operations such as patient registration, medicine details, and doctor channel bookings.

### 5.3 Patient

Patients can register, log in, book doctor appointments, view their medical records, update sickness details, and manage their profile.

---

## 6. System Panels

# A. Staff Panel

## 6.1 Staff Login

Staff members must log in using their email/username and password.

### Staff Login Fields

* Email / Username
* Password
* Login Button
* Forgot Password Option

## 6.2 Staff Dashboard

The staff dashboard shows daily clinic activities.

### Dashboard Features

* Total patients
* Today appointments
* Pending appointments
* Completed appointments
* Available doctors
* Medicine stock summary
* Recent patient bookings

## 6.3 Patient Details Management

Staff can add, update, view, and search patient details.

### Patient Details Fields

* Patient ID
* Full Name
* Age
* Gender
* Contact Number
* Address
* Email
* Blood Group
* Allergies
* Emergency Contact Number
* Registered Date

### Features

* Add new patient
* Update patient details
* Search patient by name, phone number, or patient ID
* View patient profile
* Delete or deactivate patient record

## 6.4 Medicine Details Management

Staff can manage medicine records available in the clinic.

### Medicine Details Fields

* Medicine ID
* Medicine Name
* Category
* Description
* Quantity
* Unit Price
* Expiry Date
* Supplier Name
* Status

### Features

* Add medicine
* Update medicine
* View medicine list
* Search medicine
* Low-stock alert
* Expired medicine alert

## 6.5 Doctor Channel Booking Management

Staff can book appointments for patients who visit or call the clinic.

### Booking Fields

* Appointment ID
* Patient ID
* Patient Name
* Doctor Name
* Appointment Date
* Appointment Time
* Appointment Number
* Reason / Symptoms
* Booking Status

### Features

* Create doctor channel booking
* Generate appointment number automatically
* View available doctors
* Select date and time
* Update booking status
* Cancel booking
* Print appointment receipt

### Appointment Number Example

Example format:

**APP-2026-001**

---

# B. Patient Panel

## 6.6 Patient Registration

Patients can create an account using their personal details.

### Registration Fields

* Full Name
* Email
* Phone Number
* Password
* Confirm Password
* Date of Birth
* Gender
* Address

## 6.7 Patient Login

Patients can log in using their email and password.

## 6.8 Patient Dashboard

The patient dashboard displays personal appointment and health information.

### Dashboard Features

* Upcoming appointments
* Previous appointments
* Medical history summary
* Health progress chart
* Profile completion status
* Doctor messages or notes

## 6.9 Online Doctor Channel Booking

Patients can book doctor appointments online.

### Booking Process

1. Patient logs in.
2. Patient selects doctor.
3. Patient selects available date.
4. Patient selects available time slot.
5. Patient enters sickness/reason.
6. System confirms booking.
7. Appointment number is generated.

### Patient Booking Fields

* Doctor Name
* Specialization
* Date
* Time Slot
* Symptoms / Reason
* Patient Note

## 6.10 Patient Medical Health Progress

Patients can update and view their health progress.

### Health Progress Fields

* Date
* Weight
* Blood Pressure
* Sugar Level
* Temperature
* Symptoms
* Current Health Status
* Doctor Notes

### Features

* Add health update
* View health history
* View progress chart
* Track sickness improvement

## 6.11 Sickness Update Section

Patients can update their sickness condition before or after appointments.

### Sickness Update Fields

* Sickness Title
* Symptoms
* Severity Level
* Started Date
* Current Status
* Uploaded Report/Image

### Severity Levels

* Mild
* Moderate
* Serious

## 6.12 Patient Profile Analytics

The system gives basic analytics about the patient profile and health records.

### Analytics Features

* Total appointments
* Completed appointments
* Cancelled appointments
* Most visited doctor
* Health progress graph
* Sickness update history
* Medicine history

## 6.13 Additional Patient Options

* Download medical reports
* View prescription history
* Upload lab reports
* Receive appointment reminders
* Change password
* Update profile details
* Send message to clinic staff

---

# C. Admin / Doctor Panel

## 6.14 Admin / Doctor Login

Admin and doctors log in using secure credentials.

## 6.15 Admin Dashboard

Admin dashboard shows complete clinic overview.

### Dashboard Features

* Total patients
* Total doctors
* Total staff members
* Today appointments
* Monthly appointments
* Revenue summary
* Medicine stock summary
* Appointment status report

## 6.16 Doctor Management

Admin can manage doctor details.

### Doctor Details Fields

* Doctor ID
* Full Name
* Specialization
* Email
* Contact Number
* Available Days
* Available Time Slots
* Channel Fee
* Status

### Features

* Add doctor
* Update doctor
* Delete/deactivate doctor
* Manage doctor schedule
* View doctor appointments

## 6.17 Staff Management

Admin can manage staff accounts.

### Staff Details Fields

* Staff ID
* Full Name
* Email
* Contact Number
* Role
* Username
* Password
* Status

### Features

* Add staff member
* Update staff member
* Disable staff account
* View staff activities

## 6.18 Appointment Management

Admin/doctor can view and manage all appointments.

### Appointment Status Types

* Pending
* Confirmed
* Completed
* Cancelled

### Features

* View all appointments
* Filter by date, doctor, or patient
* Update appointment status
* View patient reason/symptoms
* Add doctor notes

## 6.19 Patient Medical Record Management

Doctors can view patient health details and add medical notes.

### Medical Record Fields

* Record ID
* Patient Name
* Doctor Name
* Diagnosis
* Prescription
* Medicine Details
* Doctor Notes
* Next Visit Date
* Created Date

### Features

* View patient history
* Add diagnosis
* Add prescription
* Add medical notes
* View uploaded reports

## 6.20 Reports

Admin can generate reports for clinic management.

### Report Types

* Daily appointment report
* Monthly appointment report
* Patient report
* Doctor report
* Medicine stock report
* Revenue report
* Cancelled appointment report

---

## 7. Login and Role-Based Access Control

The system must include secure login for all users.

### Login Roles

| Role    | Access                                        |
| ------- | --------------------------------------------- |
| Admin   | Full system access                            |
| Doctor  | Patient medical records and appointments      |
| Staff   | Patient, medicine, and booking management     |
| Patient | Own appointments, profile, and health records |

### Security Features

* Password encryption
* Role-based dashboard redirect
* Session management
* Logout function
* Forgot password option
* Input validation
* Account active/inactive status

---

## 8. Main System Modules

1. User Login and Registration Module
2. Patient Management Module
3. Doctor Management Module
4. Staff Management Module
5. Appointment Booking Module
6. Medicine Management Module
7. Medical Records Module
8. Health Progress Tracking Module
9. Prescription Management Module
10. Reports and Analytics Module
11. Notification Module
12. Profile Management Module

---

## 9. Suggested Database Tables

### 9.1 users

* id
* name
* email
* password
* role
* status
* created_at
* updated_at

### 9.2 patients

* id
* user_id
* patient_code
* full_name
* phone
* address
* gender
* date_of_birth
* blood_group
* allergies
* emergency_contact
* created_at
* updated_at

### 9.3 doctors

* id
* user_id
* doctor_code
* full_name
* specialization
* phone
* available_days
* available_time
* channel_fee
* status
* created_at
* updated_at

### 9.4 staff

* id
* user_id
* staff_code
* full_name
* phone
* position
* status
* created_at
* updated_at

### 9.5 appointments

* id
* appointment_no
* patient_id
* doctor_id
* appointment_date
* appointment_time
* reason
* status
* created_by
* created_at
* updated_at

### 9.6 medicines

* id
* medicine_code
* medicine_name
* category
* description
* quantity
* unit_price
* expiry_date
* supplier_name
* status
* created_at
* updated_at

### 9.7 medical_records

* id
* patient_id
* doctor_id
* appointment_id
* diagnosis
* prescription
* doctor_notes
* next_visit_date
* created_at
* updated_at

### 9.8 health_progress

* id
* patient_id
* date
* weight
* blood_pressure
* sugar_level
* temperature
* symptoms
* health_status
* created_at
* updated_at

### 9.9 sickness_updates

* id
* patient_id
* sickness_title
* symptoms
* severity_level
* started_date
* current_status
* report_file
* created_at
* updated_at

### 9.10 notifications

* id
* user_id
* title
* message
* type
* is_read
* created_at
* updated_at

---

## 10. Appointment Workflow

1. Patient or staff creates a booking.
2. System checks doctor availability.
3. System generates appointment number.
4. Appointment status becomes pending or confirmed.
5. Patient receives appointment details.
6. Doctor views appointment on doctor panel.
7. Doctor checks patient and adds diagnosis/prescription.
8. Appointment status changes to completed.
9. Patient can view medical record and health progress.

---

## 11. Suggested Technologies

### Frontend

* React.js / HTML / CSS / Bootstrap / Tailwind CSS

### Backend

* Laravel / PHP or Java Spring Boot

### Database

* MySQL

### Other Tools

* Postman for API testing
* GitHub for version control
* VS Code / IntelliJ IDEA

---

## 12. Functional Requirements

* The system shall allow users to log in according to their role.
* The system shall allow patients to register online.
* The system shall allow staff to manage patient records.
* The system shall allow staff to manage medicine records.
* The system shall allow staff and patients to book doctor appointments.
* The system shall generate appointment numbers automatically.
* The system shall allow doctors to view patient history.
* The system shall allow doctors to add diagnosis and prescriptions.
* The system shall allow patients to update sickness details.
* The system shall allow patients to track health progress.
* The system shall allow admin to generate reports.

---

## 13. Non-Functional Requirements

* The system should be user-friendly.
* The system should be secure.
* The system should be responsive on desktop and mobile devices.
* The system should load quickly.
* The system should protect patient medical data.
* The system should support future updates.

---

## 14. Future Enhancements

* SMS appointment reminders
* Email notifications
* Online payment for channel booking
* Doctor video consultation
* AI-based health suggestion system
* Pharmacy billing module
* Lab report management
* Mobile app for patients

---

## 15. Conclusion

The Doctor Appointment Management System helps clinics manage appointments, patients, doctors, staff, medicines, and medical records in one digital platform. It improves efficiency, reduces manual errors, and provides better service to patients. The three-panel structure makes the system easy to use for staff, patients, and doctors/admins.
