import { FormEvent, useEffect, useState } from 'react';
import { ImagePlus, KeyRound, Mail, Phone, Save, UserRound } from 'lucide-react';
import { showError, showSuccess } from '../../../lib/alerts';
import { api, updateStoredUser, User } from '../../../lib/api';

export function StaffProfilePage({ user, onProfileChanged }: { user: User; onProfileChanged?: (user: User) => void }) {
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

      const result = await api<{ user: User }>('/auth/profile', {
        method: 'POST',
        body: payload,
      });

      updateStoredUser(result.user);
      onProfileChanged?.(result.user);
      setProfileImage(null);
      setForm((current) => ({
        ...current,
        current_password: '',
        password: '',
        password_confirmation: '',
      }));
      showSuccess('Staff profile updated');
    } catch (error) {
      showError('Profile update failed', (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_360px]">
      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
        <div className="flex flex-col gap-4 border-b border-[#eceef5] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#14a6a1]">Staff profile</p>
            <h1 className="mt-1 text-2xl font-bold text-[#566a7f]">Account settings</h1>
            <p className="mt-1 text-sm text-[#a1acb8]">Update staff photo, login email, phone, and password.</p>
          </div>
          <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-[#e8fbf7] text-2xl font-bold text-[#14a6a1]">
            {previewUrl ? <img src={previewUrl} alt="Staff profile preview" className="h-full w-full object-cover" /> : user.name.charAt(0)}
          </span>
        </div>

        <form onSubmit={submit} className="mt-5 grid gap-4">
          <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#bdece4] bg-[#fbfffe] px-4 py-5 text-center text-[#14a6a1] hover:bg-[#e8fbf7]">
            <ImagePlus className="h-6 w-6" />
            <span className="text-sm font-bold">{profileImage ? profileImage.name : 'Choose staff profile image'}</span>
            <span className="text-xs font-semibold text-[#a1acb8]">PNG or JPG, up to 4 MB</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => setProfileImage(event.target.files?.[0] ?? null)} />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <StaffField icon={<UserRound className="h-4 w-4" />} label="Staff name" value={form.name} required onChange={(name) => setForm((current) => ({ ...current, name }))} />
            <StaffField icon={<Mail className="h-4 w-4" />} label="Email login" value={form.email} type="email" required onChange={(email) => setForm((current) => ({ ...current, email }))} />
            <StaffField icon={<Phone className="h-4 w-4" />} label="Phone" value={form.phone} onChange={(phone) => setForm((current) => ({ ...current, phone }))} />
          </div>

          <div className="rounded-2xl border border-[#eceef5] bg-[#fcfdff] p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8fbf7] text-[#14a6a1]">
                <KeyRound className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-bold text-[#566a7f]">Change password</span>
                <span className="block text-sm text-[#a1acb8]">Leave empty to keep the current password.</span>
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <StaffField label="Current password" value={form.current_password} type="password" onChange={(current_password) => setForm((current) => ({ ...current, current_password }))} />
              <StaffField label="New password" value={form.password} type="password" onChange={(password) => setForm((current) => ({ ...current, password }))} />
              <StaffField label="Confirm password" value={form.password_confirmation} type="password" onChange={(password_confirmation) => setForm((current) => ({ ...current, password_confirmation }))} />
            </div>
          </div>

          <button disabled={saving} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#14a6a1] px-4 font-bold text-white disabled:opacity-60">
            <Save className="h-4 w-4" />
            {saving ? 'Saving profile...' : 'Save staff profile'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
        <p className="text-sm font-bold text-[#14a6a1]">Staff access</p>
        <h2 className="mt-1 text-xl font-bold text-[#566a7f]">Profile security</h2>
        <p className="mt-2 text-sm leading-6 text-[#697a8d]">
          Password changes require the current password. Email changes apply to the next staff login immediately.
        </p>
      </section>
    </div>
  );
}

function StaffField({ icon, label, value, onChange, type = 'text', required = false }: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="mb-1 block text-sm font-bold text-[#566a7f]">{label}</span>
      <span className="relative block">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a1acb8]">{icon}</span>}
        <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className={`min-h-11 w-full rounded-xl border border-[#d9dee3] bg-white px-3 outline-none focus:border-[#14a6a1] ${icon ? 'pl-10' : ''}`} />
      </span>
    </label>
  );
}
