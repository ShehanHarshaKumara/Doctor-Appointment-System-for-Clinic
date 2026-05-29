import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartPulse,
  ImagePlus,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Pill,
  Save,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, Appointment, Doctor, Medicine, updateStoredUser, User } from '../../lib/api';

type PatientPageProps = {
  user: User;
  summary: Record<string, number>;
  appointments: Appointment[];
  onProfileChanged?: (user: User) => void;
};

const statusTone: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  confirmed: 'bg-sky-50 text-sky-700 ring-sky-200',
  arrived: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  in_progress: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
  no_show: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const doctorMedia: Record<string, { image: string; description: string; focus: string }> = {
  cardiology: {
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=900&auto=format&fit=crop',
    description: 'Heart health, blood pressure review, chest discomfort follow-up, and long-term cardiac wellness support.',
    focus: 'Heart care',
  },
  neurology: {
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=900&auto=format&fit=crop',
    description: 'Headache, nerve pain, dizziness, sleep concerns, and neurological symptom review with patient-first guidance.',
    focus: 'Nerve care',
  },
  dermatology: {
    image: 'https://images.unsplash.com/photo-1550831107-1553da8c8464?w=900&auto=format&fit=crop',
    description: 'Skin, hair, allergy, acne, rash, and cosmetic skin-care consultations with practical treatment planning.',
    focus: 'Skin care',
  },
  default: {
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=900&auto=format&fit=crop',
    description: 'General consultation, diagnosis support, follow-up review, and friendly care for everyday health concerns.',
    focus: 'Clinic care',
  },
};

export function PatientHomePage({ user, summary, appointments }: PatientPageProps) {
  const upcoming = useMemo(() => appointments.filter((item) => !['completed', 'cancelled', 'no_show'].includes(item.status)), [appointments]);
  const nextVisit = upcoming[0];

  return (
    <PatientPageShell eyebrow="Patient home" title="" subtitle="" showHeader={false}>
      <PremiumPatientHero user={user} nextVisit={nextVisit} activeCount={upcoming.length} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Appointments" value={appointments.length} detail="Total bookings" icon={<Calendar />} />
        <Metric label="Upcoming" value={upcoming.length} detail="Active care visits" icon={<Activity />} />
        <Metric label="Completed" value={appointments.filter((item) => item.status === 'completed').length} detail="Finished visits" icon={<CheckCircle2 />} />
        <Metric label="Clinic today" value={summary.today_appointments ?? 0} detail="All clinic visits" icon={<HeartPulse />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-2xl shadow-teal-950/20">
          <div className="max-w-xl">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-teal-100">Next appointment</span>
            <h2 className="mt-5 text-3xl font-black">{nextVisit ? nextVisit.doctor.full_name : 'No upcoming booking'}</h2>
            <p className="mt-3 text-white/70">{nextVisit ? `${formatLongDate(nextVisit.appointment_date)} at ${nextVisit.time_slot}` : 'Use the Appointment page to book your next doctor channel.'}</p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <HeroMini label="Secure" value="Patient login" icon={<ShieldCheck />} />
            <HeroMini label="Records" value="Visit history" icon={<FileText />} />
            <HeroMini label="Medicine" value="Clinic stock" icon={<Pill />} />
          </div>
        </div>

        <div className="grid gap-4">
          <InfoTile icon={<UserRound />} title="Patient no" value={user.patient?.patient_no ?? 'Registered'} detail={user.email} />
          <InfoTile icon={<Phone />} title="Contact phone" value={user.phone ?? user.patient?.phone ?? 'Not added'} detail="Used for appointment updates" />
          <InfoTile icon={<MapPin />} title="Clinic location" value="CAMS Clinic" detail="Colombo care center" />
        </div>
      </div>
    </PatientPageShell>
  );
}

function PremiumPatientHero({ user, nextVisit, activeCount }: { user: User; nextVisit?: Appointment; activeCount: number }) {
  return (
    <div className="patient-home-hero mb-6 grid overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-teal-950/20 lg:min-h-[430px] lg:grid-cols-[1fr_430px]">
      <div className="relative isolate flex flex-col justify-center p-5 sm:p-8 lg:p-10">
        <img
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&auto=format&fit=crop"
          alt="Premium patient care"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-28"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(4,17,29,0.96),rgba(10,93,94,0.92)_52%,rgba(15,23,42,0.85))]" />
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-teal-50">
          <Sparkles className="h-4 w-4 text-amber-200" />
          Premium patient website
        </span>
        <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
          Your care, bookings, medicines, reports, and profile in one modern place.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
          Designed for patients after login with fast navigation, clean health cards, responsive layout, and a premium clinic experience.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <HeroMini label="Patient" value={user.patient?.patient_no ?? 'Verified'} icon={<ShieldCheck />} />
          <HeroMini label="Next visit" value={nextVisit ? formatShortDate(nextVisit.appointment_date) : 'Book now'} icon={<Calendar />} />
          <HeroMini label="Active care" value={`${activeCount} booking${activeCount === 1 ? '' : 's'}`} icon={<Activity />} />
        </div>
      </div>

      <div className="patient-home-scene hidden place-items-center p-8 lg:grid" aria-hidden="true">
        <div className="patient-home-device">
          <div className="patient-home-device-screen">
            <div className="patient-home-pulse">
              <HeartPulse className="h-14 w-14" />
            </div>
            <div className="patient-home-line patient-home-line-a" />
            <div className="patient-home-line patient-home-line-b" />
            <div className="patient-home-line patient-home-line-c" />
          </div>
          <span className="patient-home-badge patient-home-badge-a">Doctors</span>
          <span className="patient-home-badge patient-home-badge-b">Reports</span>
          <span className="patient-home-badge patient-home-badge-c">Medicine</span>
        </div>
      </div>
    </div>
  );
}

export function PatientDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    api<{ doctors: Doctor[] }>('/doctors')
      .then((data) => setDoctors(data.doctors))
      .catch((error) => toast.error(error.message));
  }, []);

  return (
    <PatientPageShell eyebrow="Doctors" title="Choose your clinic doctor" subtitle="Browse active doctors, specializations, channel fees, and care details before booking.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {doctors.map((doctor) => {
          const media = doctorMedia[doctor.specialization.toLowerCase()] ?? doctorMedia.default;

          return (
          <div key={doctor.id} className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-lg shadow-slate-200/70 transition hover:-translate-y-1 hover:shadow-xl">
            <div className="relative h-64 overflow-hidden bg-slate-200">
              <img src={media.image} alt={`${doctor.full_name} ${doctor.specialization}`} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-2 text-xs font-black uppercase text-emerald-700 shadow-sm">
                Available doctor
              </span>
              <span className="absolute bottom-4 left-4 rounded-full bg-teal-400 px-3 py-2 text-xs font-black uppercase text-slate-950 shadow-lg">
                {media.focus}
              </span>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                  <Stethoscope className="h-7 w-7" />
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black uppercase text-emerald-700 ring-1 ring-emerald-200">
                  Open now
                </span>
              </div>
              <h2 className="mt-5 text-xl font-black">{doctor.full_name}</h2>
              <p className="font-bold text-teal-700">{doctor.specialization}</p>
              <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">{doctor.bio || media.description}</p>
              <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">{media.description}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <span className="block text-xs font-black uppercase text-slate-400">Channel fee</span>
                <span className="mt-1 inline-flex items-center gap-2 font-black text-slate-950">
                  <WalletCards className="h-4 w-4 text-amber-600" />
                  Rs. {doctor.channel_fee}
                </span>
              </div>
              <div className="rounded-2xl bg-teal-50 px-4 py-3">
                <span className="block text-xs font-black uppercase text-teal-500">Booking</span>
                <span className="mt-1 block font-black text-teal-800">Open now</span>
              </div>
            </div>
            </div>
          </div>
          );
        })}
      </div>
    </PatientPageShell>
  );
}

export function PatientMedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    api<{ medicines: Medicine[] }>('/medicines')
      .then((data) => setMedicines(data.medicines))
      .catch(() => setMedicines([]));
  }, []);

  return (
    <PatientPageShell eyebrow="Medicine" title="Patient related medicines" subtitle="View clinic medicine availability and helpful medicine notes connected to your care journey.">
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/20">
          <Pill className="h-10 w-10 text-teal-200" />
          <h2 className="mt-5 text-2xl font-black">Medicine guidance</h2>
          <p className="mt-3 leading-7 text-white/70">Always follow your doctor's dosage instructions. Use this page to check clinic medicine names and discuss prescriptions during appointments.</p>
          <div className="mt-6 grid gap-3">
            <HeroMini label="Safety" value="Doctor approved" icon={<ShieldCheck />} />
            <HeroMini label="Records" value="Discuss at visits" icon={<ClipboardList />} />
          </div>
        </div>

        <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-lg shadow-slate-200/70">
          <h2 className="text-xl font-black">Clinic medicine list</h2>
          <div className="mt-4 grid gap-3">
            {medicines.slice(0, 8).map((medicine) => (
              <div key={medicine.id} className="grid gap-2 rounded-2xl bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-black text-slate-950">{medicine.name}</p>
                  <p className="text-sm text-slate-500">{medicine.generic_name || medicine.category || 'Clinic medicine'}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-2 text-xs font-black text-teal-700 ring-1 ring-slate-200">{medicine.status}</span>
              </div>
            ))}
            {medicines.length === 0 && <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">No medicine records available for patients right now.</p>}
          </div>
        </div>
      </div>
    </PatientPageShell>
  );
}

export function PatientReportsPage({ appointments }: PatientPageProps) {
  const completed = appointments.filter((item) => item.status === 'completed');

  return (
    <PatientPageShell eyebrow="Reports" title="My visit reports" subtitle="Review appointment history, doctor notes, statuses, and completed consultation records.">
      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-lg shadow-slate-200/70">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase text-teal-700">{appointment.appointment_no}</p>
                <h2 className="mt-1 text-xl font-black">{appointment.doctor.full_name}</h2>
                <p className="mt-1 text-sm text-slate-500">{formatLongDate(appointment.appointment_date)} at {appointment.time_slot}</p>
              </div>
              <span className={`w-fit rounded-full px-3 py-2 text-xs font-black ring-1 ${statusTone[appointment.status] ?? statusTone.no_show}`}>{appointment.status.replaceAll('_', ' ')}</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <InfoLine label="Reason" value={appointment.reason || 'Not added'} />
              <InfoLine label="Doctor notes" value={appointment.doctor_notes || 'No doctor note recorded'} />
            </div>
          </div>
        ))}
        {appointments.length === 0 && <EmptyState title="No reports yet" detail="Reports will appear after you create and complete appointments." />}
      </div>
      <p className="mt-5 text-sm font-semibold text-slate-500">{completed.length} completed report{completed.length === 1 ? '' : 's'} available.</p>
    </PatientPageShell>
  );
}

export function PatientProfilePage({ user, onProfileChanged }: PatientPageProps) {
  const patient = user.patient;
  const [form, setForm] = useState({
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(user.profile_image_url ?? patient?.profile_image_url ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl(user.profile_image_url ?? patient?.profile_image_url ?? '');
      return;
    }

    const objectUrl = URL.createObjectURL(profileImage);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profileImage, user.profile_image_url, patient?.profile_image_url]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('email', form.email);
      payload.append('phone', form.phone);
      if (profileImage) payload.append('profile_image', profileImage);
      if (form.password) {
        payload.append('current_password', form.current_password);
        payload.append('password', form.password);
        payload.append('password_confirmation', form.password_confirmation);
      }

      const result = await api<{ user: User }>('/auth/profile', { method: 'POST', body: payload });
      updateStoredUser(result.user);
      onProfileChanged?.(result.user);
      setProfileImage(null);
      setForm((current) => ({ ...current, current_password: '', password: '', password_confirmation: '' }));
      toast.success('Patient profile updated');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PatientPageShell eyebrow="Profile" title="My patient profile" subtitle="Personal information connected to your patient login and clinic records.">
      <div className="grid gap-6 xl:grid-cols-[0.62fr_1.38fr]">
        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/20">
          <span className="grid h-28 w-28 place-items-center overflow-hidden rounded-3xl bg-white/10 text-3xl font-black">
            {previewUrl ? <img src={previewUrl} alt="Patient profile preview" className="h-full w-full object-cover" /> : initials(user.name)}
          </span>
          <h2 className="mt-5 text-2xl font-black">{user.name}</h2>
          <p className="mt-1 text-white/60">{user.email}</p>
          <p className="mt-5 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-teal-100">{patient?.patient_no ?? 'Patient account'}</p>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-slate-200/70">
          <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-teal-200 bg-teal-50/60 px-4 py-5 text-center text-teal-700 transition hover:bg-teal-50">
            <ImagePlus className="h-7 w-7" />
            <span className="text-sm font-black">{profileImage ? profileImage.name : 'Choose patient profile image'}</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => setProfileImage(event.target.files?.[0] ?? null)} />
          </label>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <PatientField icon={<UserRound className="h-4 w-4" />} label="Patient name" value={form.name} required onChange={(name) => setForm((current) => ({ ...current, name }))} />
            <PatientField icon={<Mail className="h-4 w-4" />} label="Email login" value={form.email} type="email" required onChange={(email) => setForm((current) => ({ ...current, email }))} />
            <PatientField icon={<Phone className="h-4 w-4" />} label="Phone" value={form.phone} onChange={(phone) => setForm((current) => ({ ...current, phone }))} />
            <PatientField icon={<Calendar className="h-4 w-4" />} label="Date of birth" value={patient?.date_of_birth ?? 'Not added'} disabled onChange={() => undefined} />
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center gap-2 text-slate-950">
              <KeyRound className="h-5 w-5 text-teal-700" />
              <strong>Change password</strong>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <PatientField label="Current password" value={form.current_password} type="password" onChange={(current_password) => setForm((current) => ({ ...current, current_password }))} />
              <PatientField label="New password" value={form.password} type="password" onChange={(password) => setForm((current) => ({ ...current, password }))} />
              <PatientField label="Confirm password" value={form.password_confirmation} type="password" onChange={(password_confirmation) => setForm((current) => ({ ...current, password_confirmation }))} />
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <InfoTile icon={<UserRound />} title="Gender" value={patient?.gender ?? 'Not added'} detail="Patient detail" />
            <InfoTile icon={<HeartPulse />} title="Blood type" value={patient?.blood_type ?? 'Not added'} detail="Health detail" />
            <InfoTile icon={<MapPin />} title="Address" value={patient?.address ?? 'Not added'} detail="Home address" />
          </div>

          <button disabled={saving} className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-950 via-teal-800 to-cyan-600 px-5 font-black text-white shadow-xl shadow-teal-900/20 disabled:opacity-60">
            <Save className="h-5 w-5" />
            {saving ? 'Saving profile...' : 'Save patient profile'}
          </button>
        </form>
      </div>
    </PatientPageShell>
  );
}

function PatientPageShell({ eyebrow, title, subtitle, children, showHeader = true }: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  showHeader?: boolean;
}) {
  return (
    <section className="patient-portal min-h-screen overflow-hidden bg-[#f6fbfb] text-slate-950">
      <div className="patient-ambient" />
      <div className="mx-auto w-full max-w-none px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
        {showHeader !== false && (
          <div className="mb-6">
            <span className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-black uppercase text-teal-700">{eyebrow}</span>
            <h1 className="mt-4 text-3xl font-black tracking-normal text-slate-950 sm:text-5xl">{title}</h1>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">{subtitle}</p>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function Metric({ label, value, detail, icon }: { label: string; value: number; detail: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-lg shadow-slate-200/70">
      <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700 [&>svg]:h-6 [&>svg]:w-6">{icon}</span>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function HeroMini({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
      <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-amber-100 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <p className="text-xs font-black uppercase text-white/50">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function InfoTile({ icon, title, value, detail }: { icon: React.ReactNode; title: string; value: string; detail: string }) {
  return (
    <div className="min-w-0 rounded-3xl border border-white/80 bg-white/90 p-5 shadow-lg shadow-slate-200/70">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <p className="mt-4 text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-1 truncate text-lg font-black text-slate-950">{value}</p>
      <p className="mt-1 truncate text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function PatientField({ icon, label, value, onChange, type = 'text', required = false, disabled = false }: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-black text-slate-800">{label}</span>
      <span className="relative block">
        {icon && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input
          required={required}
          disabled={disabled}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`min-h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-500 ${icon ? 'pl-12' : ''}`}
        />
      </span>
    </label>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-8 text-center">
      <FileText className="mx-auto h-10 w-10 text-slate-400" />
      <p className="mt-3 font-black text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function formatLongDate(date: string) {
  return new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(date));
}
