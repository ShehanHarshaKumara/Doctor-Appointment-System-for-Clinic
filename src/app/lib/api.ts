const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';
export const SESSION_EXPIRED_EVENT = 'clinic-session-expired';

export type Role = 'admin' | 'doctor' | 'staff' | 'patient';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profile_image_url?: string | null;
  role: Role;
  patient?: Patient | null;
  doctor?: Doctor | null;
  staff?: { id: number; full_name: string; position: string } | null;
}

export interface Doctor {
  id: number;
  doctor_no?: string;
  full_name: string;
  specialization: string;
  phone?: string;
  qualification?: string;
  bio?: string;
  channel_fee: string;
  is_active?: boolean;
  availability?: Record<string, string[]>;
  user?: Pick<User, 'id' | 'name' | 'email' | 'phone' | 'role'> & { is_active?: boolean };
}

export interface Staff {
  id: number;
  staff_no: string;
  full_name: string;
  position: string;
  permissions?: string[];
  is_active?: boolean;
  user?: Pick<User, 'id' | 'name' | 'email' | 'phone' | 'role'> & { is_active?: boolean };
}

export interface Patient {
  id: number;
  patient_no: string;
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  blood_type?: string;
  allergies?: string;
  emergency_contact?: string;
  profile_image_url?: string;
  documents?: PatientDocument[];
  created_at?: string;
}

export interface PatientDocument {
  id: number;
  name: string;
  mime_type?: string;
  size: number;
  url?: string;
  created_at?: string;
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
  generic_name?: string;
  category?: string;
  dosage_form?: string;
  stock_qty: number;
  low_stock_threshold: number;
  unit_price: string;
  expiry_date?: string;
  supplier?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

function token() {
  return localStorage.getItem('clinic_token');
}

export function saveSession(authToken: string, user: User) {
  localStorage.setItem('clinic_token', authToken);
  localStorage.setItem('clinic_user', JSON.stringify(user));
}

export function updateStoredUser(user: User) {
  localStorage.setItem('clinic_user', JSON.stringify(user));
}

export function loadUser(): User | null {
  if (!token()) {
    localStorage.removeItem('clinic_user');
    return null;
  }

  const raw = localStorage.getItem('clinic_user');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    clearSession();
    return null;
  }
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
    let message = payload.message ?? 'Request failed';

    if (response.status === 401 && !path.startsWith('/auth/login') && !path.startsWith('/auth/register')) {
      message = 'Your session expired. Please sign in again.';
      clearSession();
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, {
        detail: { message },
      }));
    }

    throw new Error(message);
  }

  return payload;
}
