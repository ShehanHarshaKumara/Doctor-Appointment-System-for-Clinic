import { useEffect, useState } from 'react';
import {
  CalendarDays,
  ClipboardPlus,
  FileText,
  HeartPulse,
  ImagePlus,
  Mail,
  MapPinned,
  PencilLine,
  Phone,
  Plus,
  Search,
  Upload,
  Trash2,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { confirmDelete, showSuccess } from '../../lib/alerts';
import { api, Appointment, Patient, PatientDocument } from '../../lib/api';

type PatientForm = {
  full_name: string;
  phone: string;
  email: string;
  date_of_birth: string;
  gender: string;
  address: string;
  blood_type: string;
  allergies: string;
  emergency_contact: string;
};

type PatientReport = {
  total_appointments: number;
  upcoming_appointments: number;
  completed_appointments: number;
  recent_appointments: Appointment[];
};

const emptyForm: PatientForm = {
  full_name: '',
  phone: '',
  email: '',
  date_of_birth: '',
  gender: '',
  address: '',
  blood_type: '',
  allergies: '',
  emergency_contact: '',
};

export function AdminPatientsPage({ onChanged }: { onChanged: () => void }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [report, setReport] = useState<PatientReport | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<PatientForm>(emptyForm);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [activeView, setActiveView] = useState<'registry' | 'form'>('registry');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPatients = async (query = search) => {
    const suffix = query.trim() ? `?search=${encodeURIComponent(query.trim())}` : '';
    const data = await api<{ patients: Patient[] }>(`/patients${suffix}`);
    setPatients(data.patients);
    return data.patients;
  };

  const loadReport = async (patient: Patient) => {
    const data = await api<{ patient: Patient; report: PatientReport }>(`/patients/${patient.id}`);
    setSelectedPatient(data.patient);
    setReport(data.report);
  };

  useEffect(() => {
    loadPatients()
      .then((items) => {
        if (items[0]) loadReport(items[0]).catch(() => undefined);
      })
      .catch((error) => toast.error(error.message));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = mediaPayload(form, profileImage, documents);
      const result = editingPatient
        ? await api<{ patient: Patient }>(`/patients/${editingPatient.id}`, { method: 'PATCH', body: payload })
        : await api<{ patient: Patient }>('/patients', { method: 'POST', body: payload });

      toast.success(editingPatient ? 'Patient updated' : 'Patient created');
      setEditingPatient(null);
      setActiveView('registry');
      setForm(emptyForm);
      setProfileImage(null);
      setDocuments([]);
      const items = await loadPatients();
      const current = items.find((patient) => patient.id === result.patient.id) ?? result.patient;
      await loadReport(current);
      onChanged();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setActiveView('form');
    setForm({
      full_name: patient.full_name ?? '',
      phone: patient.phone ?? '',
      email: patient.email ?? '',
      date_of_birth: patient.date_of_birth ?? '',
      gender: patient.gender ?? '',
      address: patient.address ?? '',
      blood_type: patient.blood_type ?? '',
      allergies: patient.allergies ?? '',
      emergency_contact: patient.emergency_contact ?? '',
    });
  };

  const startCreate = () => {
    setEditingPatient(null);
    setForm(emptyForm);
    setProfileImage(null);
    setDocuments([]);
    setActiveView('form');
  };

  const closeEditor = () => {
    setEditingPatient(null);
    setForm(emptyForm);
    setProfileImage(null);
    setDocuments([]);
    setActiveView('registry');
  };

  const removePatient = async (patient: Patient) => {
    const confirmed = await confirmDelete(
      `Delete ${patient.full_name}?`,
      'This removes the patient record from active lists.'
    );
    if (!confirmed) return;

    try {
      await api(`/patients/${patient.id}`, { method: 'DELETE' });
      showSuccess('Patient deleted');
      const items = await loadPatients();
      if (selectedPatient?.id === patient.id) {
        if (items[0]) await loadReport(items[0]);
        else {
          setSelectedPatient(null);
          setReport(null);
        }
      }
      onChanged();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  if (activeView === 'form') {
    return (
      <div className="mt-6">
        <PatientTabBar activeView={activeView} onRegistry={closeEditor} onForm={startCreate} editingPatient={editingPatient} />
        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <PatientEditor form={form} setForm={setForm} onSubmit={submit} editingPatient={editingPatient} loading={loading} onCancel={closeEditor} profileImage={profileImage} documents={documents} setProfileImage={setProfileImage} setDocuments={setDocuments} />
          <PatientFormSidePanel patient={editingPatient} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <PatientTabBar activeView={activeView} onRegistry={closeEditor} onForm={startCreate} editingPatient={editingPatient} />
      <div className="mt-4 grid gap-5 2xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
      <section className="min-w-0 overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
        <div className="border-b border-[#eceef5] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold text-[#696cff]">Patient registry</p>
              <h1 className="mt-1 text-2xl font-bold text-[#566a7f]">Patients</h1>
              <p className="mt-1 text-sm text-[#a1acb8]">Create records, review reports, update details, and remove inactive entries.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <form onSubmit={(event) => {
                event.preventDefault();
                loadPatients().catch((error) => toast.error(error.message));
              }} className="flex min-w-0 gap-2">
                <label className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#f5f5f9] px-3 text-[#697a8d]">
                  <Search className="h-4 w-4 shrink-0" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patient no, name, phone" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
                </label>
                <button className="min-h-12 rounded-xl bg-[#696cff] px-4 text-sm font-bold text-white">Find</button>
              </form>
              <button type="button" onClick={startCreate} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#566a7f] px-4 text-sm font-bold text-white">
                <Plus className="h-4 w-4" />
                Add patient
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-4 md:hidden">
          {patients.map((patient) => (
            <PatientMobileCard key={patient.id} patient={patient} onView={loadReport} onEdit={startEdit} onDelete={removePatient} selected={selectedPatient?.id === patient.id} />
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="bg-[#f5f5f9] text-xs font-bold uppercase text-[#a1acb8]">
              <tr>
                <th className="px-5 py-4">Patient</th>
                <th>Contact</th>
                <th>Blood</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className={`border-t border-[#eceef5] ${selectedPatient?.id === patient.id ? 'bg-[#fbfbff]' : ''}`}>
                  <td className="px-5 py-4">
                    <button onClick={() => loadReport(patient)} className="text-left">
                      <span className="block font-bold text-[#566a7f]">{patient.full_name}</span>
                      <span className="block text-xs font-bold text-[#696cff]">{patient.patient_no}</span>
                    </button>
                  </td>
                  <td className="pr-4">
                    <span className="block font-semibold text-[#566a7f]">{patient.phone}</span>
                    <span className="block break-all text-xs text-[#a1acb8]">{patient.email ?? 'No email'}</span>
                  </td>
                  <td className="pr-4">{patient.blood_type ?? '-'}</td>
                  <td className="max-w-[220px] truncate pr-4">{patient.address ?? '-'}</td>
                  <td className="pr-5">
                    <div className="flex gap-2">
                      <IconButton title="View report" onClick={() => loadReport(patient)} icon={<FileText className="h-4 w-4" />} />
                      <IconButton title="Edit patient" onClick={() => startEdit(patient)} icon={<PencilLine className="h-4 w-4" />} />
                      <IconButton title="Delete patient" danger onClick={() => removePatient(patient)} icon={<Trash2 className="h-4 w-4" />} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {patients.length === 0 && <p className="px-5 py-10 text-center text-[#a1acb8]">No patients found.</p>}
      </section>

      <div className="grid min-w-0 gap-5">
        <PatientReportCard patient={selectedPatient} report={report} onEdit={startEdit} />
      </div>
      </div>
    </div>
  );
}

function PatientTabBar({ activeView, onRegistry, onForm, editingPatient }: {
  activeView: 'registry' | 'form';
  onRegistry: () => void;
  onForm: () => void;
  editingPatient: Patient | null;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-2 shadow-[0_2px_6px_rgba(67,89,113,0.12)] sm:flex-row sm:items-center sm:justify-between">
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={onRegistry} className={`min-h-11 rounded-xl px-4 text-sm font-bold ${activeView === 'registry' ? 'bg-[#696cff] text-white' : 'bg-[#f5f5f9] text-[#697a8d]'}`}>
          Patient registry
        </button>
        <button type="button" onClick={onForm} className={`min-h-11 rounded-xl px-4 text-sm font-bold ${activeView === 'form' ? 'bg-[#696cff] text-white' : 'bg-[#f5f5f9] text-[#697a8d]'}`}>
          {editingPatient ? 'Edit patient form' : 'Add patient form'}
        </button>
      </div>
      <p className="px-2 text-sm text-[#a1acb8]">
        {activeView === 'form' ? 'Complete patient details and save the record.' : 'Choose Add patient to open the form tab.'}
      </p>
    </div>
  );
}

function PatientFormSidePanel({ patient }: { patient: Patient | null }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
      <p className="text-sm font-bold text-[#696cff]">{patient ? 'Current patient' : 'New record'}</p>
      <h2 className="mt-1 text-xl font-bold text-[#566a7f]">{patient?.full_name ?? 'Patient form workspace'}</h2>
      <p className="mt-2 text-sm leading-6 text-[#697a8d]">
        Add the profile photo, contact details, emergency information, and any report files before saving.
      </p>
      <div className="mt-5 grid gap-3">
        <FormHint icon={<ImagePlus className="h-4 w-4" />} text="Profile image is stored with the patient record." />
        <FormHint icon={<Upload className="h-4 w-4" />} text="Reports and documents appear in patient details." />
        <FormHint icon={<FileText className="h-4 w-4" />} text="Edit an existing patient to add more files later." />
      </div>
    </section>
  );
}

function FormHint({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex gap-3 rounded-xl bg-[#f8f8fb] p-3 text-sm text-[#566a7f]">
      <span className="mt-0.5 text-[#696cff]">{icon}</span>
      <span className="font-semibold">{text}</span>
    </div>
  );
}

function PatientEditor({ form, setForm, onSubmit, editingPatient, loading, onCancel, profileImage, documents, setProfileImage, setDocuments }: {
  form: PatientForm;
  setForm: React.Dispatch<React.SetStateAction<PatientForm>>;
  onSubmit: (event: React.FormEvent) => void;
  editingPatient: Patient | null;
  loading: boolean;
  onCancel: () => void;
  profileImage: File | null;
  documents: File[];
  setProfileImage: (file: File | null) => void;
  setDocuments: (files: File[]) => void;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#696cff]">{editingPatient ? 'Edit patient' : 'New patient'}</p>
          <h2 className="mt-1 text-xl font-bold text-[#566a7f]">{editingPatient ? editingPatient.patient_no : 'Add patient form'}</h2>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eef0ff] text-[#696cff]">
          <ClipboardPlus className="h-5 w-5" />
        </span>
      </div>
      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-bold text-[#566a7f]">Profile image</span>
          <span className="flex min-h-20 items-center gap-3 rounded-xl border border-dashed border-[#cfd3ff] bg-[#fcfdff] p-3 text-sm text-[#697a8d]">
            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#eef0ff] text-[#696cff]">
              {profileImage ? <img src={URL.createObjectURL(profileImage)} alt="" className="h-full w-full object-cover" /> : editingPatient?.profile_image_url ? <img src={editingPatient.profile_image_url} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-5 w-5" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{profileImage?.name ?? 'Upload patient photo'}</span>
              <span className="block text-xs text-[#a1acb8]">JPG, PNG, or WEBP up to 4 MB.</span>
            </span>
            <input type="file" accept="image/*" onChange={(event) => setProfileImage(event.target.files?.[0] ?? null)} className="max-w-[210px] text-xs" />
          </span>
        </label>
        <PatientField label="Full name" value={form.full_name} required onChange={(full_name) => setForm((current) => ({ ...current, full_name }))} />
        <PatientField label="Phone" value={form.phone} required onChange={(phone) => setForm((current) => ({ ...current, phone }))} />
        <PatientField label="Email" value={form.email} type="email" onChange={(email) => setForm((current) => ({ ...current, email }))} />
        <PatientField label="Date of birth" value={form.date_of_birth} type="date" onChange={(date_of_birth) => setForm((current) => ({ ...current, date_of_birth }))} />
        <PatientField label="Gender" value={form.gender} onChange={(gender) => setForm((current) => ({ ...current, gender }))} />
        <PatientField label="Blood type" value={form.blood_type} onChange={(blood_type) => setForm((current) => ({ ...current, blood_type }))} />
        <PatientField label="Emergency contact" value={form.emergency_contact} onChange={(emergency_contact) => setForm((current) => ({ ...current, emergency_contact }))} />
        <PatientField label="Address" value={form.address} onChange={(address) => setForm((current) => ({ ...current, address }))} />
        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-bold text-[#566a7f]">Allergies / report note</span>
          <textarea value={form.allergies} onChange={(event) => setForm((current) => ({ ...current, allergies: event.target.value }))} rows={3} className="w-full rounded-xl border border-[#d9dee3] bg-[#fcfdff] px-3 py-2 outline-none focus:border-[#696cff]" />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-bold text-[#566a7f]">Reports and documents</span>
          <span className="flex min-h-20 flex-col gap-2 rounded-xl border border-dashed border-[#cfd3ff] bg-[#fcfdff] p-3 text-sm text-[#697a8d] sm:flex-row sm:items-center">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#eef0ff] text-[#696cff]"><Upload className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{documents.length ? `${documents.length} new file${documents.length === 1 ? '' : 's'} ready` : 'Attach lab reports or patient documents'}</span>
              <span className="block text-xs text-[#a1acb8]">PDF, DOC, DOCX, JPG, or PNG. Up to 5 files, 10 MB each.</span>
            </span>
            <input type="file" multiple accept=".pdf,.doc,.docx,image/jpeg,image/png" onChange={(event) => setDocuments(Array.from(event.target.files ?? []))} className="max-w-[240px] text-xs" />
          </span>
        </label>
        <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
          <button disabled={loading} className="min-h-12 flex-1 rounded-xl bg-[#696cff] px-4 font-bold text-white disabled:opacity-60">
            {loading ? 'Saving...' : editingPatient ? 'Update patient' : 'Create patient'}
          </button>
          <button type="button" onClick={onCancel} className="min-h-12 rounded-xl border border-[#d9dee3] px-4 font-bold text-[#697a8d]">
            {editingPatient ? 'Cancel edit' : 'Close form'}
          </button>
        </div>
      </form>
    </section>
  );
}

function PatientReportCard({ patient, report, onEdit }: { patient: Patient | null; report: PatientReport | null; onEdit: (patient: Patient) => void }) {
  if (!patient || !report) {
    return <section className="rounded-2xl bg-white p-6 text-center text-[#a1acb8] shadow-[0_2px_6px_rgba(67,89,113,0.12)]">Select a patient to view details and reports.</section>;
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
      <div className="border-b border-[#eceef5] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <PatientAvatar patient={patient} />
            <span className="min-w-0">
            <p className="text-sm font-bold text-[#696cff]">Patient report</p>
            <h2 className="mt-1 truncate text-xl font-bold text-[#566a7f]">{patient.full_name}</h2>
            <p className="text-sm text-[#a1acb8]">{patient.patient_no}</p>
            </span>
          </div>
          <IconButton title="Edit patient" onClick={() => onEdit(patient)} icon={<PencilLine className="h-4 w-4" />} />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <ReportMetric label="Visits" value={report.total_appointments} />
          <ReportMetric label="Upcoming" value={report.upcoming_appointments} />
          <ReportMetric label="Completed" value={report.completed_appointments} />
        </div>
      </div>
      <div className="grid gap-3 p-5 text-sm sm:grid-cols-2">
        <DetailLine icon={<Phone className="h-4 w-4" />} label="Phone" value={patient.phone} />
        <DetailLine icon={<Mail className="h-4 w-4" />} label="Email" value={patient.email ?? 'No email'} />
        <DetailLine icon={<HeartPulse className="h-4 w-4" />} label="Blood type" value={patient.blood_type ?? '-'} />
        <DetailLine icon={<UserRound className="h-4 w-4" />} label="Gender" value={patient.gender ?? '-'} />
        <DetailLine icon={<CalendarDays className="h-4 w-4" />} label="Birth date" value={patient.date_of_birth ?? '-'} />
        <DetailLine icon={<Phone className="h-4 w-4" />} label="Emergency" value={patient.emergency_contact ?? '-'} />
        <DetailLine icon={<MapPinned className="h-4 w-4" />} label="Address" value={patient.address ?? '-'} wide />
        <DetailLine icon={<FileText className="h-4 w-4" />} label="Allergies" value={patient.allergies ?? 'None recorded'} wide />
      </div>
      <PatientDocuments documents={patient.documents ?? []} />
      <div className="border-t border-[#eceef5] p-5">
        <h3 className="font-bold text-[#566a7f]">Recent appointments</h3>
        <div className="mt-3 grid gap-2">
          {report.recent_appointments.slice(0, 5).map((appointment) => (
            <div key={appointment.id} className="flex flex-col gap-2 rounded-xl bg-[#f8f8fb] px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span>
                <span className="block font-bold text-[#566a7f]">{appointment.doctor.full_name}</span>
                <span className="block text-xs text-[#a1acb8]">{appointment.appointment_date} at {appointment.time_slot}</span>
              </span>
              <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold capitalize text-[#696cff]">{appointment.status.replace('_', ' ')}</span>
            </div>
          ))}
          {report.recent_appointments.length === 0 && <p className="rounded-xl bg-[#f8f8fb] px-3 py-4 text-sm text-[#a1acb8]">No appointment report records yet.</p>}
        </div>
      </div>
    </section>
  );
}

function PatientMobileCard({ patient, onView, onEdit, onDelete, selected }: {
  patient: Patient;
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  selected: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 ${selected ? 'border-[#696cff] bg-[#fbfbff]' : 'border-[#eceef5] bg-[#fcfdff]'}`}>
      <button onClick={() => onView(patient)} className="flex items-center gap-3 text-left">
        <PatientAvatar patient={patient} compact />
        <span>
          <span className="block font-bold text-[#566a7f]">{patient.full_name}</span>
          <span className="block text-xs font-bold text-[#696cff]">{patient.patient_no}</span>
        </span>
      </button>
      <p className="mt-2 text-sm text-[#697a8d]">{patient.phone} - {patient.email ?? 'No email'}</p>
      <div className="mt-3 flex gap-2">
        <IconButton title="View report" onClick={() => onView(patient)} icon={<FileText className="h-4 w-4" />} />
        <IconButton title="Edit patient" onClick={() => onEdit(patient)} icon={<PencilLine className="h-4 w-4" />} />
        <IconButton title="Delete patient" danger onClick={() => onDelete(patient)} icon={<Trash2 className="h-4 w-4" />} />
      </div>
    </div>
  );
}

function PatientAvatar({ patient, compact = false }: { patient: Patient; compact?: boolean }) {
  const size = compact ? 'h-10 w-10 rounded-xl' : 'h-14 w-14 rounded-2xl';

  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden bg-[#eef0ff] font-bold text-[#696cff] ${size}`}>
      {patient.profile_image_url ? <img src={patient.profile_image_url} alt="" className="h-full w-full object-cover" /> : patient.full_name.charAt(0)}
    </span>
  );
}

function PatientField({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label>
      <span className="mb-1 block text-sm font-bold text-[#566a7f]">{label}</span>
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full rounded-xl border border-[#d9dee3] bg-[#fcfdff] px-3 outline-none focus:border-[#696cff]" />
    </label>
  );
}

function ReportMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[#f5f5f9] px-3 py-3">
      <p className="text-[11px] font-bold uppercase text-[#a1acb8]">{label}</p>
      <p className="text-xl font-bold text-[#566a7f]">{value}</p>
    </div>
  );
}

function DetailLine({ icon, label, value, wide = false }: { icon: React.ReactNode; label: string; value: string; wide?: boolean }) {
  return (
    <div className={`flex gap-3 rounded-xl bg-[#f8f8fb] p-3 ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="mt-0.5 text-[#696cff]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[11px] font-bold uppercase text-[#a1acb8]">{label}</span>
        <span className="block break-words font-semibold text-[#566a7f]">{value}</span>
      </span>
    </div>
  );
}

function IconButton({ icon, title, onClick, danger = false }: { icon: React.ReactNode; title: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={title} className={`grid h-9 w-9 place-items-center rounded-lg ${danger ? 'bg-[#fff0ed] text-[#ff3e1d]' : 'bg-[#eef0ff] text-[#696cff]'}`}>
      {icon}
    </button>
  );
}

function PatientDocuments({ documents }: { documents: PatientDocument[] }) {
  return (
    <div className="border-t border-[#eceef5] p-5">
      <h3 className="font-bold text-[#566a7f]">Uploaded reports and documents</h3>
      <div className="mt-3 grid gap-2">
        {documents.map((document) => (
          <a key={document.id} href={document.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-xl bg-[#f8f8fb] px-3 py-3 text-sm text-[#566a7f]">
            <span className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-[#696cff]" />
              <span className="truncate font-semibold">{document.name}</span>
            </span>
            <span className="shrink-0 text-xs font-bold text-[#a1acb8]">{formatFileSize(document.size)}</span>
          </a>
        ))}
        {documents.length === 0 && <p className="rounded-xl bg-[#f8f8fb] px-3 py-4 text-sm text-[#a1acb8]">No uploaded reports yet.</p>}
      </div>
    </div>
  );
}

function mediaPayload(form: PatientForm, profileImage: File | null, documents: File[]) {
  const payload = new FormData();
  Object.entries(form).forEach(([key, value]) => payload.append(key, value.trim()));
  if (profileImage) payload.append('profile_image', profileImage);
  documents.slice(0, 5).forEach((document) => payload.append('documents[]', document));
  return payload;
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
