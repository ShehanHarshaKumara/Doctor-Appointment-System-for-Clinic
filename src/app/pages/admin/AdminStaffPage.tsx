import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Eye, KeyRound, Mail, PencilLine, Phone, Plus, Search, ShieldCheck, Trash2, UserRoundPlus } from 'lucide-react';
import { toast } from 'sonner';
import { confirmDelete, showSuccess } from '../../lib/alerts';
import { api, Staff } from '../../lib/api';

type StaffForm = {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  password: string;
  password_confirmation: string;
  permissions: string[];
};

const permissionOptions = ['patients', 'appointments', 'medicines'];
const emptyForm: StaffForm = {
  full_name: '',
  email: '',
  phone: '',
  position: 'Receptionist',
  password: '',
  password_confirmation: '',
  permissions: ['patients', 'appointments'],
};

export function AdminStaffPage({ onChanged }: { onChanged: () => void }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selected, setSelected] = useState<Staff | null>(null);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [activeView, setActiveView] = useState<'registry' | 'form' | 'details'>('registry');
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const loadStaff = async () => {
    const data = await api<{ staff: Staff[] }>('/staff');
    setStaff(data.staff);
    return data.staff;
  };

  const viewStaff = async (member: Staff) => {
    const data = await api<{ staff: Staff }>(`/staff/${member.id}`);
    setSelected(data.staff);
    setActiveView('details');
  };

  useEffect(() => {
    loadStaff().then((items) => setSelected(items[0] ?? null)).catch((error) => toast.error(error.message));
  }, []);

  const visibleStaff = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return staff;
    return staff.filter((member) => [member.full_name, member.staff_no, member.position, member.user?.email]
      .some((value) => value?.toLowerCase().includes(query)));
  }, [search, staff]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setActiveView('form');
  };

  const openEdit = async (member: Staff) => {
    try {
      const data = await api<{ staff: Staff }>(`/staff/${member.id}`);
      setEditing(data.staff);
      setSelected(data.staff);
      setForm({
        full_name: data.staff.full_name,
        email: data.staff.user?.email ?? '',
        phone: data.staff.user?.phone ?? '',
        position: data.staff.position,
        password: '',
        password_confirmation: '',
        permissions: data.staff.permissions ?? [],
      });
      setActiveView('form');
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const closeForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setActiveView('registry');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload: Partial<StaffForm> = { ...form };
      if (editing && !form.password && !form.password_confirmation) {
        delete payload.password;
        delete payload.password_confirmation;
      }
      const data = editing
        ? await api<{ staff: Staff }>(`/staff/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : await api<{ staff: Staff }>('/staff', { method: 'POST', body: JSON.stringify(payload) });
      toast.success(editing ? 'Staff updated' : 'Staff account created');
      setSelected(data.staff);
      setEditing(null);
      setForm(emptyForm);
      setActiveView('registry');
      await loadStaff();
      onChanged();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const removeStaff = async (member: Staff) => {
    const confirmed = await confirmDelete(
      `Delete ${member.full_name}?`,
      'This disables staff login.'
    );
    if (!confirmed) return;

    try {
      await api(`/staff/${member.id}`, { method: 'DELETE' });
      showSuccess('Staff deleted');
      const items = await loadStaff();
      setSelected(items[0] ?? null);
      setActiveView('registry');
      onChanged();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  if (activeView === 'form') {
    return (
      <div className="mt-6">
        <StaffTabs activeView={activeView} editing={editing} onForm={openCreate} onRegistry={closeForm} />
        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <StaffFormPanel editing={editing} form={form} loading={loading} onCancel={closeForm} onSubmit={submit} setForm={setForm} />
          <StaffGuide editing={editing} />
        </div>
      </div>
    );
  }

  if (activeView === 'details') {
    return (
      <div className="mt-6">
        <StaffTabs activeView={activeView} editing={editing} onForm={openCreate} onRegistry={closeForm} />
        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <StaffDetails member={selected} onEdit={openEdit} />
          <StaffGuide editing={selected} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <StaffTabs activeView={activeView} editing={editing} onForm={openCreate} onRegistry={closeForm} />
      <section className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
        <div className="flex flex-col gap-4 border-b border-[#eceef5] p-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-[#696cff]">Staff registry</p>
            <h1 className="mt-1 text-2xl font-bold text-[#566a7f]">Staff</h1>
            <p className="mt-1 text-sm text-[#a1acb8]">Create staff logins and manage clinic permissions.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex min-h-12 items-center gap-2 rounded-xl bg-[#f5f5f9] px-3 text-[#697a8d] sm:w-[280px]">
              <Search className="h-4 w-4" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search staff" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
            </label>
            <button type="button" onClick={openCreate} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#566a7f] px-4 text-sm font-bold text-white">
              <Plus className="h-4 w-4" />
              Add staff
            </button>
          </div>
        </div>
        <div className="grid gap-3 p-4 md:hidden">
          {visibleStaff.map((member) => <StaffCard key={member.id} member={member} onDelete={removeStaff} onEdit={openEdit} onView={viewStaff} />)}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-[#f5f5f9] text-xs font-bold uppercase text-[#a1acb8]">
              <tr><th className="px-5 py-4">Staff</th><th>Position</th><th>Email</th><th>Permissions</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {visibleStaff.map((member) => (
                <tr key={member.id} className="border-t border-[#eceef5]">
                  <td className="px-5 py-4"><strong className="block text-[#566a7f]">{member.full_name}</strong><span className="text-xs font-bold text-[#696cff]">{member.staff_no}</span></td>
                  <td className="pr-4 font-semibold text-[#566a7f]">{member.position}</td>
                  <td className="break-all pr-4 text-[#697a8d]">{member.user?.email ?? '-'}</td>
                  <td className="pr-4">{formatPermissions(member.permissions)}</td>
                  <td className="pr-4"><Status active={member.is_active !== false} /></td>
                  <td className="pr-5"><ActionRow member={member} onDelete={removeStaff} onEdit={openEdit} onView={viewStaff} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visibleStaff.length === 0 && <p className="px-5 py-10 text-center text-[#a1acb8]">No staff found.</p>}
      </section>
    </div>
  );
}

function StaffTabs({ activeView, editing, onForm, onRegistry }: { activeView: 'registry' | 'form' | 'details'; editing: Staff | null; onForm: () => void; onRegistry: () => void }) {
  return <div className="flex flex-col gap-3 rounded-2xl bg-white p-2 shadow-[0_2px_6px_rgba(67,89,113,0.12)] sm:flex-row sm:items-center sm:justify-between"><div className="grid gap-2 sm:grid-cols-2"><button onClick={onRegistry} className={`min-h-11 rounded-xl px-4 text-sm font-bold ${activeView === 'registry' ? 'bg-[#696cff] text-white' : 'bg-[#f5f5f9] text-[#697a8d]'}`}>Staff registry</button><button onClick={onForm} className={`min-h-11 rounded-xl px-4 text-sm font-bold ${activeView === 'form' ? 'bg-[#696cff] text-white' : 'bg-[#f5f5f9] text-[#697a8d]'}`}>{editing ? 'Edit staff form' : 'Add staff form'}</button></div><p className="px-2 text-sm text-[#a1acb8]">{activeView === 'details' ? 'Staff detail view is open.' : activeView === 'form' ? 'Save staff login and permissions.' : 'Choose Add staff to open the form tab.'}</p></div>;
}

function StaffFormPanel({ editing, form, loading, onCancel, onSubmit, setForm }: { editing: Staff | null; form: StaffForm; loading: boolean; onCancel: () => void; onSubmit: (event: FormEvent) => void; setForm: React.Dispatch<React.SetStateAction<StaffForm>> }) {
  return <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]"><div className="mb-5 flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-[#696cff]">{editing ? 'Update staff' : 'New staff'}</p><h2 className="mt-1 text-xl font-bold text-[#566a7f]">{editing?.staff_no ?? 'Create staff account'}</h2></div><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#eef0ff] text-[#696cff]"><UserRoundPlus className="h-6 w-6" /></span></div><form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2"><Field label="Full name" value={form.full_name} required onChange={(full_name) => setForm((current) => ({ ...current, full_name }))} /><Field label="Email login" type="email" value={form.email} required onChange={(email) => setForm((current) => ({ ...current, email }))} /><Field label="Phone" value={form.phone} onChange={(phone) => setForm((current) => ({ ...current, phone }))} /><Field label="Position" value={form.position} required onChange={(position) => setForm((current) => ({ ...current, position }))} /><Field label={editing ? 'New password' : 'Password'} type="password" value={form.password} required={!editing} onChange={(password) => setForm((current) => ({ ...current, password }))} /><Field label="Confirm password" type="password" value={form.password_confirmation} required={!editing} onChange={(password_confirmation) => setForm((current) => ({ ...current, password_confirmation }))} /><fieldset className="sm:col-span-2"><legend className="mb-1 text-sm font-bold text-[#566a7f]">Permissions</legend><div className="grid gap-2 sm:grid-cols-3">{permissionOptions.map((permission) => <label key={permission} className="flex min-h-11 items-center gap-2 rounded-xl bg-[#f8f8fb] px-3 text-sm font-semibold capitalize text-[#566a7f]"><input type="checkbox" checked={form.permissions.includes(permission)} onChange={(event) => setForm((current) => ({ ...current, permissions: event.target.checked ? [...current.permissions, permission] : current.permissions.filter((item) => item !== permission) }))} />{permission}</label>)}</div></fieldset><div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row"><button disabled={loading} className="min-h-12 flex-1 rounded-xl bg-[#696cff] px-4 font-bold text-white disabled:opacity-60">{loading ? 'Saving...' : editing ? 'Update staff' : 'Create staff account'}</button><button type="button" onClick={onCancel} className="min-h-12 rounded-xl border border-[#d9dee3] px-4 font-bold text-[#697a8d]">Close</button></div></form></section>;
}

function StaffDetails({ member, onEdit }: { member: Staff | null; onEdit: (member: Staff) => void }) {
  if (!member) return <section className="rounded-2xl bg-white p-6 text-center text-[#a1acb8] shadow-[0_2px_6px_rgba(67,89,113,0.12)]">Select a staff member.</section>;
  return <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-[#696cff]">Staff detail</p><h2 className="mt-1 text-2xl font-bold text-[#566a7f]">{member.full_name}</h2><p className="text-sm text-[#a1acb8]">{member.staff_no}</p></div><IconButton title="Edit staff" icon={<PencilLine className="h-4 w-4" />} onClick={() => onEdit(member)} /></div><div className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><Fact icon={<ShieldCheck className="h-4 w-4" />} label="Position" value={member.position} /><Fact icon={<Mail className="h-4 w-4" />} label="Email" value={member.user?.email ?? '-'} /><Fact icon={<Phone className="h-4 w-4" />} label="Phone" value={member.user?.phone ?? '-'} /><Fact icon={<KeyRound className="h-4 w-4" />} label="Permissions" value={formatPermissions(member.permissions)} /></div></section>;
}

function StaffGuide({ editing }: { editing: Staff | null }) { return <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]"><p className="text-sm font-bold text-[#696cff]">Staff access</p><h2 className="mt-1 text-xl font-bold text-[#566a7f]">{editing?.full_name ?? 'Front desk account controls'}</h2><div className="mt-4 grid gap-2"><Hint icon={<Mail className="h-4 w-4" />} text="Email becomes the staff login." /><Hint icon={<KeyRound className="h-4 w-4" />} text="Saved passwords stay protected." /><Hint icon={<ShieldCheck className="h-4 w-4" />} text="Permissions limit clinic work areas." /></div></section>; }
function StaffCard({ member, onDelete, onEdit, onView }: { member: Staff; onDelete: (member: Staff) => void; onEdit: (member: Staff) => void; onView: (member: Staff) => void }) { return <article className="rounded-xl border border-[#eceef5] bg-[#fcfdff] p-4"><div className="flex justify-between gap-3"><div><strong className="block text-[#566a7f]">{member.full_name}</strong><span className="text-xs font-bold text-[#696cff]">{member.staff_no}</span></div><Status active={member.is_active !== false} /></div><p className="mt-2 text-sm font-semibold text-[#697a8d]">{member.position}</p><ActionRow member={member} onDelete={onDelete} onEdit={onEdit} onView={onView} /></article>; }
function ActionRow({ member, onDelete, onEdit, onView }: { member: Staff; onDelete: (member: Staff) => void; onEdit: (member: Staff) => void; onView: (member: Staff) => void }) { return <div className="mt-3 flex gap-2"><IconButton title="View staff" icon={<Eye className="h-4 w-4" />} onClick={() => onView(member)} /><IconButton title="Edit staff" icon={<PencilLine className="h-4 w-4" />} onClick={() => onEdit(member)} /><IconButton title="Delete staff" danger icon={<Trash2 className="h-4 w-4" />} onClick={() => onDelete(member)} /></div>; }
function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label><span className="mb-1 block text-sm font-bold text-[#566a7f]">{label}</span><input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full rounded-xl border border-[#d9dee3] bg-[#fcfdff] px-3 outline-none focus:border-[#696cff]" /></label>; }
function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="flex gap-2 rounded-xl bg-[#f8f8fb] p-3"><span className="text-[#696cff]">{icon}</span><span><span className="block text-[11px] font-bold uppercase text-[#a1acb8]">{label}</span><span className="block font-semibold text-[#566a7f]">{value}</span></span></div>; }
function Hint({ icon, text }: { icon: React.ReactNode; text: string }) { return <div className="flex gap-2 rounded-xl bg-[#f8f8fb] p-3 text-sm font-semibold text-[#566a7f]"><span className="text-[#696cff]">{icon}</span>{text}</div>; }
function Status({ active }: { active: boolean }) { return <span className={`rounded-lg px-2 py-1 text-xs font-bold ${active ? 'bg-[#e8fadf] text-[#5bbf22]' : 'bg-[#fff0ed] text-[#ff3e1d]'}`}>{active ? 'Active' : 'Inactive'}</span>; }
function IconButton({ icon, title, onClick, danger = false }: { icon: React.ReactNode; title: string; onClick: () => void; danger?: boolean }) { return <button type="button" title={title} onClick={onClick} className={`grid h-9 w-9 place-items-center rounded-lg ${danger ? 'bg-[#fff0ed] text-[#ff3e1d]' : 'bg-[#eef0ff] text-[#696cff]'}`}>{icon}</button>; }
function formatPermissions(permissions?: string[]) { return permissions?.length ? permissions.join(', ') : 'No permissions'; }
