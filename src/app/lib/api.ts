const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

export type Role = 'admin' | 'doctor' | 'staff' | 'patient';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  patient?: Patient | null;
  doctor?: Doctor | null;
  staff?: { id: number; full_name: string; position: string } | null;
}

export interface Doctor {
  id: number;
  full_name: string;
  specialization: string;
  qualification?: string;
  bio?: string;
  channel_fee: string;
  availability?: Record<string, string[]>;
}

export interface Patient {
  id: number;
  patient_no: string;
  full_name: string;
  phone: string;
  email?: string;
}

export interface Appointment {
  id: number;
  appointment_no: string;
  appointment_date: string;
  time_slot: string;
  reason?: string;
  status: string;
  doctor_notes?: string;
  patient: Patient;
  doctor: Doctor;
  booked_by?: User;
}

export interface Medicine {
  id: number;
  medicine_no: string;
  name: string;
  category?: string;
  stock_qty: number;
  low_stock_threshold: number;
  unit_price: string;
  expiry_date?: string;
  status: string;
}

function token() {
  return localStorage.getItem('clinic_token');
}

export function saveSession(authToken: string, user: User) {
  localStorage.setItem('clinic_token', authToken);
  localStorage.setItem('clinic_user', JSON.stringify(user));
}

export function loadUser(): User | null {
  const raw = localStorage.getItem('clinic_user');
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  localStorage.removeItem('clinic_token');
  localStorage.removeItem('clinic_user');
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token()) {
    headers.set('Authorization', `Bearer ${token()}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.message ?? 'Request failed';
    throw new Error(message);
  }

  return payload;
}
