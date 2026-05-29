import { FormEvent, useEffect, useState } from 'react';
import { ImagePlus, KeyRound, Mail, Phone, Save, UserRound } from 'lucide-react';
import { showError, showSuccess } from '../../../lib/alerts';
import { api, updateStoredUser, User } from '../../../lib/api';

export function DoctorProfilePage({ user, onProfileChanged }: { user: User; onProfileChanged?: (user: User) => void }) {
  const [form, setForm] = useState({
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(user.profile_image_url ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl(user.profile_image_url ?? '');
      return;
    }
    const objectUrl = URL.createObjectURL(profileImage);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profileImage, user.profile_image_url]);

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
      showSuccess('Doctor profile updated');
    } catch (error) {
      showError('Profile update failed', (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(16,24,40,0.10)]">
      <div className="flex flex-col gap-4 border-b border-[#e6eaf2] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[#2563eb]">Doctor profile</p>
          <h1 className="mt-1 text-2xl font-bold text-[#344054]">Account settings</h1>
          <p className="mt-1 text-sm text-[#667085]">Update photo, email, phone, and password.</p>
        </div>
        <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-[#eef4ff] text-2xl font-bold text-[#2563eb]">{previewUrl ? <img src={previewUrl} alt="Doctor profile preview" className="h-full w-full object-cover" /> : user.name.charAt(0)}</span>
      </div>
      <form onSubmit={submit} className="mt-5 grid gap-4">
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#bcd2ff] bg-[#f8fbff] px-4 py-5 text-center text-[#2563eb] hover:bg-[#eef4ff]">
          <ImagePlus className="h-6 w-6" />
          <span className="text-sm font-bold">{profileImage ? profileImage.name : 'Choose doctor profile image'}</span>
          <input type="file" accept="image/*" className="sr-only" onChange={(event) => setProfileImage(event.target.files?.[0] ?? null)} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <DoctorField icon={<UserRound className="h-4 w-4" />} label="Doctor name" value={form.name} required onChange={(name) => setForm((current) => ({ ...current, name }))} />
          <DoctorField icon={<Mail className="h-4 w-4" />} label="Email login" value={form.email} type="email" required onChange={(email) => setForm((current) => ({ ...current, email }))} />
          <DoctorField icon={<Phone className="h-4 w-4" />} label="Phone" value={form.phone} onChange={(phone) => setForm((current) => ({ ...current, phone }))} />
        </div>
        <div className="rounded-2xl border border-[#e6eaf2] bg-[#fcfdff] p-4">
          <div className="mb-3 flex items-center gap-2 text-[#344054]"><KeyRound className="h-5 w-5 text-[#2563eb]" /><strong>Change password</strong></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <DoctorField label="Current password" value={form.current_password} type="password" onChange={(current_password) => setForm((current) => ({ ...current, current_password }))} />
            <DoctorField label="New password" value={form.password} type="password" onChange={(password) => setForm((current) => ({ ...current, password }))} />
            <DoctorField label="Confirm password" value={form.password_confirmation} type="password" onChange={(password_confirmation) => setForm((current) => ({ ...current, password_confirmation }))} />
          </div>
        </div>
        <button disabled={saving} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-4 font-bold text-white disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'Saving profile...' : 'Save doctor profile'}</button>
      </form>
    </section>
  );
}

function DoctorField({ icon, label, value, onChange, type = 'text', required = false }: { icon?: React.ReactNode; label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label>
      <span className="mb-1 block text-sm font-bold text-[#344054]">{label}</span>
      <span className="relative block">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]">{icon}</span>}
        <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className={`min-h-11 w-full rounded-xl border border-[#d0d5dd] bg-white px-3 outline-none focus:border-[#2563eb] ${icon ? 'pl-10' : ''}`} />
      </span>
    </label>
  );
}
