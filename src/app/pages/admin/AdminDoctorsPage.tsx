import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  CircleDollarSign,
  Eye,
  KeyRound,
  Mail,
  PencilLine,
  Phone,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  UserRoundPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { confirmDelete, showSuccess } from '../../lib/alerts';
import { api, Doctor } from '../../lib/api';

type DoctorForm = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  specialization: string;
  qualification: string;
  channel_fee: string;
  bio: string;
};

const emptyForm: DoctorForm = {
  full_name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  specialization: '',
  qualification: '',
  channel_fee: '',
  bio: '',
};

export function AdminDoctorsPage({ onChanged }: { onChanged: () => void }) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [activeView, setActiveView] = useState<'registry' | 'form' | 'details'>('registry');
  const [form, setForm] = useState<DoctorForm>(emptyForm);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const detailsRef = useRef<HTMLElement | null>(null);

  const loadDoctors = async () => {
    const data = await api<{ doctors: Doctor[] }>('/doctors');
    setDoctors(data.doctors);
    return data.doctors;
  };

  const viewDoctor = async (doctor: Doctor, reveal = false) => {
    const data = await api<{ doctor: Doctor }>(`/doctors/${doctor.id}`);
    setSelectedDoctor(data.doctor);

    if (reveal) {
      setActiveView('details');
      window.setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    }

    return data.doctor;
  };

  const handleView = async (doctor: Doctor) => {
    try {
      await viewDoctor(doctor, true);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  useEffect(() => {
    loadDoctors()
      .then((items) => {
        if (items[0]) viewDoctor(items[0]).catch(() => undefined);
      })
      .catch((error) => toast.error(error.message));
  }, []);

  const visibleDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return doctors;

    return doctors.filter((doctor) => [
      doctor.full_name,
      doctor.doctor_no,
      doctor.specialization,
      doctor.qualification,
      doctor.phone,
    ].some((value) => value?.toLowerCase().includes(query)));
  }, [doctors, search]);

  const startCreate = () => {
    setEditingDoctor(null);
    setForm(emptyForm);
    setActiveView('form');
  };

  const startEdit = async (doctor: Doctor) => {
    try {
      const detail = await viewDoctor(doctor);
      setEditingDoctor(detail);
      setForm({
        full_name: detail.full_name ?? '',
        email: detail.user?.email ?? '',
        phone: detail.phone ?? '',
        password: '',
        password_confirmation: '',
        specialization: detail.specialization ?? '',
        qualification: detail.qualification ?? '',
        channel_fee: String(detail.channel_fee ?? ''),
        bio: detail.bio ?? '',
      });
      setActiveView('form');
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const closeForm = () => {
    setEditingDoctor(null);
    setForm(emptyForm);
    setActiveView('registry');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload: Partial<DoctorForm> & { channel_fee: number } = {
        ...form,
        channel_fee: form.channel_fee ? Number(form.channel_fee) : 0,
      };

      if (editingDoctor && !form.password && !form.password_confirmation) {
        delete payload.password;
        delete payload.password_confirmation;
      }

      const result = editingDoctor
        ? await api<{ doctor: Doctor }>(`/doctors/${editingDoctor.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        : await api<{ doctor: Doctor }>('/doctors', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

      toast.success(editingDoctor ? 'Doctor updated' : 'Doctor account created');
      setEditingDoctor(null);
      setForm(emptyForm);
      setActiveView('registry');
      await loadDoctors();
      await viewDoctor(result.doctor);
      onChanged();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDoctor = async (doctor: Doctor) => {
    const confirmed = await confirmDelete(
      `Delete ${doctor.full_name}?`,
      'This also disables the doctor login.'
    );
    if (!confirmed) return;

    try {
      await api(`/doctors/${doctor.id}`, { method: 'DELETE' });
      showSuccess('Doctor deleted');
      const items = await loadDoctors();
      if (selectedDoctor?.id === doctor.id) {
        if (items[0]) await viewDoctor(items[0]);
        else setSelectedDoctor(null);
      }
      onChanged();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  if (activeView === 'form') {
    return (
      <div className="mt-6">
        <DoctorTabBar activeView={activeView} editingDoctor={editingDoctor} onRegistry={closeForm} onForm={startCreate} />
        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <DoctorEditor doctor={editingDoctor} form={form} loading={loading} onCancel={closeForm} onSubmit={submit} setForm={setForm} />
          <DoctorFormGuide doctor={editingDoctor} />
        </div>
      </div>
    );
  }

  if (activeView === 'details') {
    return (
      <div className="mt-6">
        <DoctorTabBar activeView={activeView} editingDoctor={editingDoctor} onRegistry={closeForm} onForm={startCreate} />
        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <DoctorDetails doctor={selectedDoctor} detailsRef={detailsRef} onEdit={startEdit} />
          <DoctorDetailsGuide onRegistry={closeForm} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <DoctorTabBar activeView={activeView} editingDoctor={editingDoctor} onRegistry={closeForm} onForm={startCreate} />
      <div className="mt-4 grid gap-5 2xl:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
        <section className="min-w-0 overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
          <div className="border-b border-[#eceef5] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold text-[#696cff]">Doctor registry</p>
                <h1 className="mt-1 text-2xl font-bold text-[#566a7f]">Doctors</h1>
                <p className="mt-1 text-sm text-[#a1acb8]">View practitioner details, update accounts, or remove inactive doctor access.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="flex min-h-12 min-w-0 items-center gap-2 rounded-xl bg-[#f5f5f9] px-3 text-[#697a8d] sm:w-[290px]">
                  <Search className="h-4 w-4 shrink-0" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search doctors" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
                </label>
                <button type="button" onClick={startCreate} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#566a7f] px-4 text-sm font-bold text-white">
                  <Plus className="h-4 w-4" />
                  Add doctor
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4 md:hidden">
            {visibleDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} onDelete={deleteDoctor} onEdit={startEdit} onView={handleView} selected={selectedDoctor?.id === doctor.id} />
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#f5f5f9] text-xs font-bold uppercase text-[#a1acb8]">
                <tr>
                  <th className="px-5 py-4">Doctor</th>
                  <th>Specialization</th>
                  <th>Contact</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleDoctors.map((doctor) => (
                  <tr key={doctor.id} className={`border-t border-[#eceef5] ${selectedDoctor?.id === doctor.id ? 'bg-[#fbfbff]' : ''}`}>
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => handleView(doctor)} className="text-left">
                        <span className="block font-bold text-[#566a7f]">{doctor.full_name}</span>
                        <span className="block text-xs font-bold text-[#696cff]">{doctor.doctor_no ?? 'Doctor profile'}</span>
                      </button>
                    </td>
                    <td className="pr-4">
                      <span className="block font-semibold text-[#566a7f]">{doctor.specialization}</span>
                      <span className="block text-xs text-[#a1acb8]">{doctor.qualification ?? 'Qualification not set'}</span>
                    </td>
                    <td className="pr-4">{doctor.phone ?? 'Phone not set'}</td>
                    <td className="pr-4 font-semibold text-[#566a7f]">{formatFee(doctor.channel_fee)}</td>
                    <td className="pr-4"><DoctorStatus active={doctor.is_active !== false} /></td>
                    <td className="pr-5">
                      <div className="flex gap-2">
                        <IconButton title="View doctor" icon={<Eye className="h-4 w-4" />} onClick={() => handleView(doctor)} />
                        <IconButton title="Edit doctor" icon={<PencilLine className="h-4 w-4" />} onClick={() => startEdit(doctor)} />
                        <IconButton title="Delete doctor" danger icon={<Trash2 className="h-4 w-4" />} onClick={() => deleteDoctor(doctor)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visibleDoctors.length === 0 && <p className="px-5 py-10 text-center text-[#a1acb8]">No doctors found.</p>}
        </section>

        <DoctorDetails doctor={selectedDoctor} detailsRef={detailsRef} onEdit={startEdit} />
      </div>
    </div>
  );
}

function DoctorTabBar({ activeView, editingDoctor, onRegistry, onForm }: {
  activeView: 'registry' | 'form' | 'details';
  editingDoctor: Doctor | null;
  onRegistry: () => void;
  onForm: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-2 shadow-[0_2px_6px_rgba(67,89,113,0.12)] sm:flex-row sm:items-center sm:justify-between">
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={onRegistry} className={`min-h-11 rounded-xl px-4 text-sm font-bold ${activeView === 'registry' ? 'bg-[#696cff] text-white' : 'bg-[#f5f5f9] text-[#697a8d]'}`}>
          Doctor registry
        </button>
        <button type="button" onClick={onForm} className={`min-h-11 rounded-xl px-4 text-sm font-bold ${activeView === 'form' ? 'bg-[#696cff] text-white' : 'bg-[#f5f5f9] text-[#697a8d]'}`}>
          {editingDoctor ? 'Edit doctor form' : 'Add doctor form'}
        </button>
      </div>
      <p className="px-2 text-sm text-[#a1acb8]">
        {activeView === 'form' && 'Save the practitioner profile and login details.'}
        {activeView === 'details' && 'Doctor detail view is open.'}
        {activeView === 'registry' && 'Choose Add doctor to open the account form tab.'}
      </p>
    </div>
  );
}

function DoctorEditor({ doctor, form, loading, onCancel, onSubmit, setForm }: {
  doctor: Doctor | null;
  form: DoctorForm;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (event: FormEvent) => void;
  setForm: React.Dispatch<React.SetStateAction<DoctorForm>>;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#696cff]">{doctor ? 'Update practitioner' : 'New practitioner'}</p>
          <h2 className="mt-1 text-xl font-bold text-[#566a7f]">{doctor ? doctor.doctor_no : 'Create doctor account'}</h2>
          <p className="mt-1 text-sm leading-6 text-[#a1acb8]">Passwords are protected after the account is saved.</p>
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#eef0ff] text-[#696cff]">
          <UserRoundPlus className="h-6 w-6" />
        </span>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
        <DoctorField label="Doctor name" value={form.full_name} required onChange={(full_name) => setForm((current) => ({ ...current, full_name }))} />
        <DoctorField label="Email login" value={form.email} type="email" required onChange={(email) => setForm((current) => ({ ...current, email }))} />
        <DoctorField label="Phone" value={form.phone} onChange={(phone) => setForm((current) => ({ ...current, phone }))} />
        <DoctorField label="Specialization" value={form.specialization} required onChange={(specialization) => setForm((current) => ({ ...current, specialization }))} />
        <DoctorField label="Qualification" value={form.qualification} onChange={(qualification) => setForm((current) => ({ ...current, qualification }))} />
        <DoctorField label="Channel fee" value={form.channel_fee} type="number" onChange={(channel_fee) => setForm((current) => ({ ...current, channel_fee }))} />
        <DoctorField label={doctor ? 'New password' : 'Password'} value={form.password} type="password" required={!doctor} onChange={(password) => setForm((current) => ({ ...current, password }))} />
        <DoctorField label="Confirm password" value={form.password_confirmation} type="password" required={!doctor} onChange={(password_confirmation) => setForm((current) => ({ ...current, password_confirmation }))} />
        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-bold text-[#566a7f]">Doctor bio</span>
          <textarea value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} rows={3} className="w-full rounded-xl border border-[#d9dee3] bg-[#fcfdff] px-3 py-2 outline-none focus:border-[#696cff]" />
        </label>
        <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
          <button disabled={loading} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#696cff] px-4 font-bold text-white disabled:opacity-60">
            <Plus className="h-4 w-4" />
            {loading ? 'Saving...' : doctor ? 'Update doctor' : 'Create doctor account'}
          </button>
          <button type="button" onClick={onCancel} className="min-h-12 rounded-xl border border-[#d9dee3] px-4 font-bold text-[#697a8d]">
            {doctor ? 'Cancel edit' : 'Close form'}
          </button>
        </div>
      </form>
    </section>
  );
}

function DoctorFormGuide({ doctor }: { doctor: Doctor | null }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
      <p className="text-sm font-bold text-[#696cff]">{doctor ? 'Editing doctor' : 'Account checklist'}</p>
      <h2 className="mt-1 text-xl font-bold text-[#566a7f]">{doctor?.full_name ?? 'Doctor form workspace'}</h2>
      <div className="mt-5 grid gap-2">
        <FormFact icon={<Mail className="h-4 w-4" />} text="Email becomes the doctor login." />
        <FormFact icon={<KeyRound className="h-4 w-4" />} text={doctor ? 'Leave password empty to keep the current password.' : 'New passwords need 8 or more characters.'} />
        <FormFact icon={<Stethoscope className="h-4 w-4" />} text="Saved active doctors appear in appointment booking lists." />
      </div>
    </section>
  );
}

function DoctorDetailsGuide({ onRegistry }: { onRegistry: () => void }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
      <p className="text-sm font-bold text-[#696cff]">Doctor view</p>
      <h2 className="mt-1 text-xl font-bold text-[#566a7f]">Practitioner account detail</h2>
      <p className="mt-2 text-sm leading-6 text-[#697a8d]">Use Edit to update this doctor, or return to the registry for the full action table.</p>
      <button type="button" onClick={onRegistry} className="mt-5 min-h-11 rounded-xl bg-[#566a7f] px-4 text-sm font-bold text-white">
        Back to doctor registry
      </button>
    </section>
  );
}

function DoctorDetails({ doctor, detailsRef, onEdit }: { doctor: Doctor | null; detailsRef: React.RefObject<HTMLElement | null>; onEdit: (doctor: Doctor) => void }) {
  if (!doctor) {
    return <section ref={detailsRef} className="scroll-mt-4 rounded-2xl bg-white p-6 text-center text-[#a1acb8] shadow-[0_2px_6px_rgba(67,89,113,0.12)]">Select a doctor to view details.</section>;
  }

  return (
    <section ref={detailsRef} className="scroll-mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
      <div className="border-b border-[#eceef5] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#eef0ff] font-bold text-[#696cff]">{doctor.full_name.charAt(0)}</span>
            <span className="min-w-0">
              <p className="text-sm font-bold text-[#696cff]">Doctor detail</p>
              <h2 className="mt-1 truncate text-xl font-bold text-[#566a7f]">{doctor.full_name}</h2>
              <p className="text-sm text-[#a1acb8]">{doctor.doctor_no}</p>
            </span>
          </div>
          <IconButton title="Edit doctor" icon={<PencilLine className="h-4 w-4" />} onClick={() => onEdit(doctor)} />
        </div>
      </div>
      <div className="grid gap-3 p-5 text-sm sm:grid-cols-2">
        <DoctorFact icon={<Stethoscope className="h-4 w-4" />} label="Specialization" value={doctor.specialization} />
        <DoctorFact icon={<BadgeCheck className="h-4 w-4" />} label="Qualification" value={doctor.qualification ?? 'Not set'} />
        <DoctorFact icon={<Mail className="h-4 w-4" />} label="Login email" value={doctor.user?.email ?? 'Load detail to view email'} />
        <DoctorFact icon={<Phone className="h-4 w-4" />} label="Phone" value={doctor.phone ?? 'Not set'} />
        <DoctorFact icon={<CircleDollarSign className="h-4 w-4" />} label="Channel fee" value={formatFee(doctor.channel_fee)} />
        <DoctorFact icon={<BadgeCheck className="h-4 w-4" />} label="Account" value={doctor.user?.is_active === false ? 'Disabled' : 'Active'} />
        <DoctorFact icon={<Stethoscope className="h-4 w-4" />} label="Bio" value={doctor.bio ?? 'No bio recorded'} wide />
      </div>
    </section>
  );
}

function DoctorCard({ doctor, onDelete, onEdit, onView, selected }: {
  doctor: Doctor;
  onDelete: (doctor: Doctor) => void;
  onEdit: (doctor: Doctor) => void;
  onView: (doctor: Doctor) => void;
  selected: boolean;
}) {
  return (
    <article className={`rounded-xl border p-4 ${selected ? 'border-[#696cff] bg-[#fbfbff]' : 'border-[#eceef5] bg-[#fcfdff]'}`}>
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => onView(doctor)} className="min-w-0 text-left">
          <span className="block truncate font-bold text-[#566a7f]">{doctor.full_name}</span>
          <span className="block text-xs font-bold text-[#696cff]">{doctor.doctor_no ?? 'Doctor profile'}</span>
        </button>
        <DoctorStatus active={doctor.is_active !== false} />
      </div>
      <p className="mt-3 font-semibold text-[#566a7f]">{doctor.specialization}</p>
      <div className="mt-3 flex gap-2">
        <IconButton title="View doctor" icon={<Eye className="h-4 w-4" />} onClick={() => onView(doctor)} />
        <IconButton title="Edit doctor" icon={<PencilLine className="h-4 w-4" />} onClick={() => onEdit(doctor)} />
        <IconButton title="Delete doctor" danger icon={<Trash2 className="h-4 w-4" />} onClick={() => onDelete(doctor)} />
      </div>
    </article>
  );
}

function DoctorField({ label, value, onChange, type = 'text', required = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="mb-1 block text-sm font-bold text-[#566a7f]">{label}</span>
      <input required={required} type={type} min={type === 'number' ? 0 : undefined} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full rounded-xl border border-[#d9dee3] bg-[#fcfdff] px-3 outline-none focus:border-[#696cff]" />
    </label>
  );
}

function DoctorStatus({ active }: { active: boolean }) {
  return <span className={`rounded-lg px-2 py-1 text-xs font-bold ${active ? 'bg-[#e8fadf] text-[#5bbf22]' : 'bg-[#fff0ed] text-[#ff3e1d]'}`}>{active ? 'Active' : 'Inactive'}</span>;
}

function DoctorFact({ icon, label, value, wide = false }: { icon: React.ReactNode; label: string; value: string; wide?: boolean }) {
  return (
    <span className={`flex gap-2 rounded-xl bg-[#f8f8fb] p-3 ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="mt-0.5 text-[#696cff]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[11px] font-bold uppercase text-[#a1acb8]">{label}</span>
        <span className="block break-words font-semibold text-[#566a7f]">{value}</span>
      </span>
    </span>
  );
}

function FormFact({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex gap-2 rounded-xl bg-[#f8f8fb] p-3 text-sm font-semibold text-[#566a7f]">
      <span className="mt-0.5 text-[#696cff]">{icon}</span>
      <span>{text}</span>
    </span>
  );
}

function IconButton({ icon, title, onClick, danger = false }: { icon: React.ReactNode; title: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={title} className={`grid h-9 w-9 place-items-center rounded-lg ${danger ? 'bg-[#fff0ed] text-[#ff3e1d]' : 'bg-[#eef0ff] text-[#696cff]'}`}>
      {icon}
    </button>
  );
}

function formatFee(value: string) {
  return `LKR ${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
