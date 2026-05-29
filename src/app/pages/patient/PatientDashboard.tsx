import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock3,
  HeartPulse,
  MapPin,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, Appointment, Doctor, User } from '../../lib/api';

const statusTone: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  confirmed: 'bg-sky-50 text-sky-700 ring-sky-200',
  arrived: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  in_progress: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
  no_show: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export function PatientDashboard({ user, summary, appointments, onChanged }: {
  user: User;
  summary: Record<string, number>;
  appointments: Appointment[];
  onChanged: () => void;
}) {
  const nextAppointment = useMemo(() => {
    const now = new Date();
    return [...appointments]
      .filter((appointment) => !['completed', 'cancelled', 'no_show'].includes(appointment.status))
      .sort((a, b) => `${a.appointment_date} ${a.time_slot}`.localeCompare(`${b.appointment_date} ${b.time_slot}`))
      .find((appointment) => new Date(`${appointment.appointment_date}T${appointment.time_slot}`) >= now)
      ?? appointments[0];
  }, [appointments]);

  const completedVisits = appointments.filter((appointment) => appointment.status === 'completed').length;
  const activeVisits = appointments.filter((appointment) => !['completed', 'cancelled', 'no_show'].includes(appointment.status)).length;

  return (
    <section className="patient-portal min-h-screen overflow-hidden bg-[#f6fbfb] text-slate-950">
      <div className="patient-ambient" />
      <div className="mx-auto w-full max-w-none px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
        <PatientHero user={user} nextAppointment={nextAppointment} activeVisits={activeVisits} />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="My appointments" value={appointments.length} detail="All bookings" icon={<Calendar />} tone="teal" />
          <MetricCard label="Active visits" value={activeVisits} detail="Upcoming or ongoing" icon={<Activity />} tone="indigo" />
          <MetricCard label="Completed" value={completedVisits} detail="Finished consultations" icon={<CheckCircle2 />} tone="emerald" />
          <MetricCard label="Clinic today" value={summary.today_appointments ?? 0} detail="Total clinic bookings" icon={<HeartPulse />} tone="rose" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <BookingSuite onBooked={onChanged} />
          <div className="grid gap-6">
            <PatientTimeline appointments={appointments} />
            <CarePanel user={user} nextAppointment={nextAppointment} />
          </div>
        </div>
      </div>
    </section>
  );
}

function PatientHero({ user, nextAppointment, activeVisits }: { user: User; nextAppointment?: Appointment; activeVisits: number }) {
  return (
    <div className="patient-hero relative isolate overflow-hidden rounded-[2rem] bg-slate-950 px-5 py-6 text-white shadow-2xl shadow-teal-950/20 sm:px-8 sm:py-8 lg:grid lg:min-h-[390px] lg:grid-cols-[1fr_440px] lg:items-center lg:gap-8">
      <img
        src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=1800&auto=format&fit=crop"
        alt="Modern clinic care team"
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(6,22,38,0.96),rgba(8,86,91,0.9)_48%,rgba(11,34,58,0.82))]" />

      <div className="max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-teal-50 backdrop-blur">
          <Sparkles className="h-4 w-4 text-amber-200" />
          Premium patient portal
        </span>
        <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          Welcome back, {user.name}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
          Book doctors, review appointments, and follow your clinic journey from one clean mobile-first patient website.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <HeroChip icon={<ShieldCheck />} label="Secure login" value="Patient only" />
          <HeroChip icon={<Calendar />} label="Next visit" value={nextAppointment ? formatShortDate(nextAppointment.appointment_date) : 'Not booked'} />
          <HeroChip icon={<Activity />} label="Active care" value={`${activeVisits} booking${activeVisits === 1 ? '' : 's'}`} />
        </div>
      </div>

      <div className="patient-orbit-scene mt-8 hidden min-h-[300px] place-items-center lg:grid" aria-hidden="true">
        <div className="patient-orbit-card">
          <div className="patient-orbit-ring patient-orbit-ring-a" />
          <div className="patient-orbit-ring patient-orbit-ring-b" />
          <div className="patient-core">
            <HeartPulse className="h-16 w-16" />
          </div>
          <span className="patient-floating-pill patient-floating-pill-a">Channel</span>
          <span className="patient-floating-pill patient-floating-pill-b">Care</span>
          <span className="patient-floating-pill patient-floating-pill-c">Records</span>
        </div>
      </div>
    </div>
  );
}

function BookingSuite({ onBooked }: { onBooked: () => void }) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    doctor_id: '',
    appointment_date: new Date().toISOString().slice(0, 10),
    time_slot: '',
    reason: '',
  });

  const selectedDoctor = doctors.find((doctor) => String(doctor.id) === form.doctor_id);

  useEffect(() => {
    api<{ doctors: Doctor[] }>('/doctors')
      .then((data) => setDoctors(data.doctors))
      .catch((error) => toast.error(error.message));
  }, []);

  useEffect(() => {
    setSlots([]);
    if (!form.doctor_id || !form.appointment_date) return;

    api<{ slots: { time: string; available: boolean }[] }>(`/doctors/${form.doctor_id}/slots?date=${form.appointment_date}`)
      .then((data) => setSlots(data.slots))
      .catch((error) => toast.error(error.message));
  }, [form.doctor_id, form.appointment_date]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await api<{ appointment: Appointment }>('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          doctor_id: Number(form.doctor_id),
          appointment_date: form.appointment_date,
          time_slot: form.time_slot,
          reason: form.reason,
        }),
      });
      toast.success(`Booked ${result.appointment.appointment_no}`);
      setForm((current) => ({ ...current, time_slot: '', reason: '' }));
      onBooked();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-xl shadow-slate-200/80 backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-2 text-xs font-bold uppercase text-teal-700">
            <Calendar className="h-4 w-4" />
            Book appointment
          </span>
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Choose your doctor and time</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Fast channel booking with live available slots from the clinic schedule.</p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20">
          Online booking
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-800">Doctor</span>
          <select
            required
            value={form.doctor_id}
            onChange={(event) => setForm({ ...form, doctor_id: event.target.value, time_slot: '' })}
            className="min-h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          >
            <option value="">Select doctor</option>
            {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.full_name} - {doctor.specialization}</option>)}
          </select>
        </label>

        {selectedDoctor && (
          <div className="grid gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-teal-700 shadow-sm">
                <Stethoscope className="h-6 w-6" />
              </span>
              <div>
                <p className="font-bold">{selectedDoctor.full_name}</p>
                <p className="text-sm text-slate-500">{selectedDoctor.specialization}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
              <WalletCards className="h-4 w-4" />
              Rs. {selectedDoctor.channel_fee}
            </span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date" type="date" value={form.appointment_date} onChange={(appointment_date) => setForm({ ...form, appointment_date, time_slot: '' })} />
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-800">Available time</span>
            <select
              required
              value={form.time_slot}
              onChange={(event) => setForm({ ...form, time_slot: event.target.value })}
              className="min-h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            >
              <option value="">Select time</option>
              {slots.map((slot) => <option key={slot.time} value={slot.time} disabled={!slot.available}>{slot.time}{slot.available ? '' : ' - booked'}</option>)}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-800">Reason or symptoms</span>
          <textarea
            value={form.reason}
            onChange={(event) => setForm({ ...form, reason: event.target.value })}
            rows={4}
            placeholder="Tell the doctor what you need help with"
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
        </label>

        <button disabled={loading} className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-950 via-teal-800 to-cyan-600 px-5 font-extrabold text-white shadow-xl shadow-teal-900/20 transition hover:-translate-y-0.5 hover:brightness-105 disabled:translate-y-0 disabled:opacity-60">
          {loading ? 'Confirming...' : 'Confirm appointment'}
          <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
        </button>
      </form>
    </div>
  );
}

function PatientTimeline({ appointments }: { appointments: Appointment[] }) {
  return (
    <div className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-xl shadow-slate-200/80 backdrop-blur sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-2 text-xs font-bold uppercase text-indigo-700">
            <Clock3 className="h-4 w-4" />
            My visits
          </span>
          <h2 className="mt-4 text-2xl font-bold">Appointment timeline</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">{appointments.length} total</span>
      </div>

      <div className="grid gap-3">
        {appointments.slice(0, 6).map((appointment) => (
          <div key={appointment.id} className="grid gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex min-w-0 gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                <Stethoscope className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-slate-950">{appointment.doctor.full_name}</p>
                <p className="text-sm text-slate-500">{formatLongDate(appointment.appointment_date)} at {appointment.time_slot}</p>
                <p className="mt-1 text-sm font-semibold text-teal-700">{appointment.appointment_no}</p>
              </div>
            </div>
            <span className={`w-fit rounded-full px-3 py-2 text-xs font-bold ring-1 ${statusTone[appointment.status] ?? statusTone.no_show}`}>
              {appointment.status.replaceAll('_', ' ')}
            </span>
          </div>
        ))}
        {appointments.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <Calendar className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 font-bold text-slate-700">No appointments yet</p>
            <p className="mt-1 text-sm text-slate-500">Book your first visit from the appointment panel.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CarePanel({ user, nextAppointment }: { user: User; nextAppointment?: Appointment }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <InfoTile icon={<UserRound />} title="Patient profile" value={user.patient?.patient_no ?? 'Registered'} detail={user.email} />
      <InfoTile icon={<Phone />} title="Contact" value={user.phone ?? user.patient?.phone ?? 'Add phone'} detail="Used for appointment updates" />
      <InfoTile icon={<MapPin />} title="Clinic" value="CAMS Clinic" detail="Colombo care center" />
      <InfoTile icon={<MessageSquareText />} title="Next reason" value={nextAppointment?.reason || 'No note yet'} detail="Shared with your doctor" />
    </div>
  );
}

function MetricCard({ label, value, detail, icon, tone }: {
  label: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
  tone: 'teal' | 'indigo' | 'emerald' | 'rose';
}) {
  const tones = {
    teal: 'bg-teal-50 text-teal-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
  };

  return (
    <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-lg shadow-slate-200/70 backdrop-blur">
      <span className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl [&>svg]:h-6 [&>svg]:w-6 ${tones[tone]}`}>{icon}</span>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function HeroChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-amber-100 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <p className="text-xs font-bold uppercase text-white/55">{label}</p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}

function InfoTile({ icon, title, value, detail }: { icon: React.ReactNode; title: string; value: string; detail: string }) {
  return (
    <div className="min-w-0 rounded-3xl border border-white/80 bg-white/90 p-5 shadow-lg shadow-slate-200/70 backdrop-blur">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <p className="mt-4 text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-1 truncate text-lg font-bold text-slate-950">{value}</p>
      <p className="mt-1 truncate text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-800">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
      />
    </label>
  );
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(date));
}

function formatLongDate(date: string) {
  return new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}
