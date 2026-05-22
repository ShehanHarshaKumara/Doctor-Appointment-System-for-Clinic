import { useEffect, useState } from 'react';
import { Calendar, ClipboardList, Stethoscope, Users } from 'lucide-react';
import { toast } from 'sonner';
import { api, Appointment, Doctor, Patient, Role, User } from '../../lib/api';
import { roleDestinationLabel } from '../../lib/roles';

const statusOptions = ['pending', 'confirmed', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show'];

export function RoleDashboardPage({ user, summary, appointments, onChanged }: {
  user: User;
  summary: Record<string, number>;
  appointments: Appointment[];
  onChanged: () => void;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">{roleDestinationLabel(user.role)}</p>
          <h2 className="text-3xl font-bold">Welcome, {user.name}</h2>
          <p className="mt-1 text-slate-600">Manage appointments with the role-based access defined in the project document.</p>
        </div>
      </div>

      <Stats summary={summary} role={user.role} />

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.3fr]">
        {user.role === 'patient' && <AppointmentForm mode="patient" onBooked={onChanged} />}
        {user.role === 'staff' && <AppointmentForm mode="staff" onBooked={onChanged} />}
        {user.role === 'doctor' && <DoctorNotice />}
        <AppointmentsTable user={user} appointments={appointments} onChanged={onChanged} />
      </div>
    </section>
  );
}

function AppointmentForm({ mode, onBooked }: { mode: 'patient' | 'staff'; onBooked: () => void }) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [form, setForm] = useState({
    doctor_id: '',
    patient_id: '',
    patient_name: '',
    patient_phone: '',
    patient_email: '',
    appointment_date: new Date().toISOString().slice(0, 10),
    time_slot: '',
    reason: '',
  });

  useEffect(() => {
    api<{ doctors: Doctor[] }>('/doctors').then((data) => setDoctors(data.doctors));
    if (mode === 'staff') {
      api<{ patients: Patient[] }>('/patients').then((data) => setPatients(data.patients)).catch(() => undefined);
    }
  }, [mode]);

  useEffect(() => {
    if (!form.doctor_id || !form.appointment_date) return;
    api<{ slots: { time: string; available: boolean }[] }>(`/doctors/${form.doctor_id}/slots?date=${form.appointment_date}`)
      .then((data) => setSlots(data.slots))
      .catch((error) => toast.error(error.message));
  }, [form.doctor_id, form.appointment_date]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: Record<string, unknown> = {
      doctor_id: Number(form.doctor_id),
      appointment_date: form.appointment_date,
      time_slot: form.time_slot,
      reason: form.reason,
    };

    if (mode === 'staff') {
      if (form.patient_id) {
        payload.patient_id = Number(form.patient_id);
      } else {
        payload.patient = {
          full_name: form.patient_name,
          phone: form.patient_phone,
          email: form.patient_email,
        };
      }
    }

    try {
      const result = await api<{ appointment: Appointment }>('/appointments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      toast.success(`Booked ${result.appointment.appointment_no}`);
      setForm({ ...form, time_slot: '', reason: '', patient_name: '', patient_phone: '', patient_email: '' });
      onBooked();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Panel title={mode === 'patient' ? 'Book New Appointment' : 'Staff Channel Booking'} icon={<Calendar className="h-5 w-5" />}>
      <form onSubmit={submit} className="space-y-4">
        {mode === 'staff' && (
          <>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Existing patient</span>
              <select value={form.patient_id} onChange={(event) => setForm({ ...form, patient_id: event.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2">
                <option value="">Create quick walk-in patient</option>
                {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.patient_no} - {patient.full_name}</option>)}
              </select>
            </label>
            {!form.patient_id && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Patient name" value={form.patient_name} onChange={(patient_name) => setForm({ ...form, patient_name })} />
                <Field label="Patient phone" value={form.patient_phone} onChange={(patient_phone) => setForm({ ...form, patient_phone })} />
                <Field label="Patient email" value={form.patient_email} onChange={(patient_email) => setForm({ ...form, patient_email })} type="email" required={false} />
              </div>
            )}
          </>
        )}
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Doctor</span>
          <select required value={form.doctor_id} onChange={(event) => setForm({ ...form, doctor_id: event.target.value, time_slot: '' })} className="w-full rounded-md border border-slate-300 px-3 py-2">
            <option value="">Select doctor</option>
            {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.full_name} - {doctor.specialization}</option>)}
          </select>
        </label>
        <Field label="Date" value={form.appointment_date} onChange={(appointment_date) => setForm({ ...form, appointment_date, time_slot: '' })} type="date" />
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Available time slot</span>
          <select required value={form.time_slot} onChange={(event) => setForm({ ...form, time_slot: event.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2">
            <option value="">Select time</option>
            {slots.map((slot) => <option key={slot.time} value={slot.time} disabled={!slot.available}>{slot.time}{slot.available ? '' : ' - booked'}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Reason / symptoms</span>
          <textarea value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <button className="w-full rounded-lg bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700">Confirm appointment</button>
      </form>
    </Panel>
  );
}

function AppointmentsTable({ user, appointments, onChanged }: { user: User; appointments: Appointment[]; onChanged: () => void }) {
  const updateStatus = async (appointment: Appointment, status: string) => {
    try {
      await api(`/appointments/${appointment.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      toast.success('Appointment updated');
      onChanged();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Panel title={user.role === 'doctor' ? 'My Schedule' : 'Appointments'} icon={<ClipboardList className="h-5 w-5" />}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-3">No</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-b border-slate-100">
                <td className="py-3 font-semibold text-teal-700">{appointment.appointment_no}</td>
                <td>{appointment.patient.full_name}</td>
                <td>{appointment.doctor.full_name}</td>
                <td>{appointment.appointment_date}</td>
                <td>{appointment.time_slot}</td>
                <td><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{appointment.status}</span></td>
                <td>
                  {['admin', 'staff', 'doctor'].includes(user.role) ? (
                    <select value={appointment.status} onChange={(event) => updateStatus(appointment, event.target.value)} className="rounded-md border border-slate-300 px-2 py-1">
                      {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  ) : (
                    <span className="text-slate-500">View only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && <p className="py-8 text-center text-slate-500">No appointments found.</p>}
      </div>
    </Panel>
  );
}

function DoctorNotice() {
  return (
    <Panel title="Consultation Notes" icon={<Stethoscope className="h-5 w-5" />}>
      <p className="text-slate-600">Doctors can update appointment statuses now. Diagnosis, prescriptions, and consultation-note editing are prepared as the next backend module.</p>
    </Panel>
  );
}

function Stats({ summary, role }: { summary: Record<string, number>; role: Role }) {
  const cards = [
    ['Patients', summary.total_patients ?? 0, Users],
    ['Doctors', summary.total_doctors ?? 0, Stethoscope],
    ['Today', summary.today_appointments ?? 0, Calendar],
    [role === 'patient' ? 'My pending' : 'Pending', summary.pending_appointments ?? 0, ClipboardList],
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([label, value, Icon]) => (
        <div key={String(label)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Icon className="mb-3 h-6 w-6 text-teal-700" />
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <span className="text-teal-700">{icon}</span>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = true, autoComplete }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      <input required={required} autoComplete={autoComplete} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-teal-600" />
    </label>
  );
}
