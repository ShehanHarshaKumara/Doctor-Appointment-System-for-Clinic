import { FormEvent, useEffect, useState } from 'react';
import {
  Camera,
  Eye,
  EyeOff,
  ImagePlus,
  KeyRound,
  Mail,
  Phone,
  Save,
  Shield,
  UserRound,
} from 'lucide-react';
import { showError, showSuccess } from '../../lib/alerts';
import { api, updateStoredUser, User } from '../../lib/api';

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  current_password: string;
  password: string;
  password_confirmation: string;
};

export function AdminProfilePage({ user, onProfileChanged }: { user: User; onProfileChanged: (user: User) => void }) {
  const [form, setForm] = useState<ProfileForm>({
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(user.profile_image_url ?? '');
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
    }));
  }, [user.email, user.name, user.phone]);

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
      onProfileChanged(result.user);
      setProfileImage(null);
      setForm((current) => ({
        ...current,
        current_password: '',
        password: '',
        password_confirmation: '',
      }));
      showSuccess('Admin profile updated');
    } catch (error) {
      showError('Profile update failed', (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
        <div className="flex flex-col gap-5 border-b border-[#eceef5] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-[#696cff]">Admin profile</p>
            <h1 className="mt-1 text-2xl font-bold text-[#566a7f]">Account settings</h1>
            <p className="mt-1 text-sm leading-6 text-[#a1acb8]">Change profile photo, email, phone, and password for this admin login.</p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-[#f8f8fb] p-3">
            <span className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#eef0ff] text-2xl font-bold text-[#696cff]">
              {previewUrl ? <img src={previewUrl} alt="Admin profile preview" className="h-full w-full object-cover" /> : user.name.charAt(0)}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-bold text-[#566a7f]">{user.name}</span>
              <span className="block break-all text-sm text-[#697a8d]">{user.email}</span>
              <span className="mt-2 inline-flex rounded-lg bg-[#e8fadf] px-2 py-1 text-xs font-bold text-[#5bbf22]">Administrator</span>
            </span>
          </div>
        </div>

        <form onSubmit={submit} className="mt-5 grid gap-4">
          <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#c9ccef] bg-[#fbfbff] px-4 py-5 text-center text-[#696cff] hover:bg-[#f5f5ff]">
            <ImagePlus className="h-6 w-6" />
            <span className="text-sm font-bold">{profileImage ? profileImage.name : 'Choose admin profile image'}</span>
            <span className="text-xs font-semibold text-[#a1acb8]">PNG or JPG, up to 4 MB</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => setProfileImage(event.target.files?.[0] ?? null)} />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <ProfileField icon={<UserRound className="h-4 w-4" />} label="Admin name" value={form.name} required onChange={(name) => setForm((current) => ({ ...current, name }))} />
            <ProfileField icon={<Mail className="h-4 w-4" />} label="Email login" value={form.email} type="email" required onChange={(email) => setForm((current) => ({ ...current, email }))} />
            <ProfileField icon={<Phone className="h-4 w-4" />} label="Phone" value={form.phone} onChange={(phone) => setForm((current) => ({ ...current, phone }))} />
          </div>

          <div className="rounded-2xl border border-[#eceef5] bg-[#fcfdff] p-4">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff2d6] text-[#ffab00]">
                  <KeyRound className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-bold text-[#566a7f]">Change password</span>
                  <span className="block text-sm text-[#a1acb8]">Leave these fields empty to keep the current password.</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswords((visible) => !visible)}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition ${showPasswords ? 'bg-[#eef0ff] text-[#696cff]' : 'bg-white text-[#697a8d] ring-1 ring-[#d9dee3]'}`}
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPasswords ? 'Hide passwords' : 'Show passwords'}
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <ProfileField label="Current password" value={form.current_password} type={showPasswords ? 'text' : 'password'} onChange={(current_password) => setForm((current) => ({ ...current, current_password }))} />
              <ProfileField label="New password" value={form.password} type={showPasswords ? 'text' : 'password'} onChange={(password) => setForm((current) => ({ ...current, password }))} />
              <ProfileField label="Confirm password" value={form.password_confirmation} type={showPasswords ? 'text' : 'password'} onChange={(password_confirmation) => setForm((current) => ({ ...current, password_confirmation }))} />
            </div>
          </div>

          <button disabled={saving} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#696cff] px-4 font-bold text-white shadow-lg shadow-indigo-100 disabled:opacity-60">
            <Save className="h-4 w-4" />
            {saving ? 'Saving profile...' : 'Save admin profile'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
        <p className="text-sm font-bold text-[#696cff]">Profile security</p>
        <h2 className="mt-1 text-xl font-bold text-[#566a7f]">Admin account control</h2>
        <div className="mt-5 grid gap-3">
          <ProfileFact icon={<Shield className="h-4 w-4" />} title="Protected panel" text="Only admin accounts can open this profile page." />
          <ProfileFact icon={<Mail className="h-4 w-4" />} title="Email login" text="Changing email updates the admin login email immediately." />
          <ProfileFact icon={<Camera className="h-4 w-4" />} title="Profile image" text="Uploading a new image replaces the previous admin profile photo." />
          <ProfileFact icon={<KeyRound className="h-4 w-4" />} title="Password safety" text="Password changes require the current password first." />
        </div>
      </section>
    </div>
  );
}

function ProfileField({ icon, label, value, onChange, type = 'text', required = false }: {
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
        <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className={`min-h-11 w-full rounded-xl border border-[#d9dee3] bg-white px-3 outline-none focus:border-[#696cff] ${icon ? 'pl-10' : ''}`} />
      </span>
    </label>
  );
}

function ProfileFact({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-[#f8f8fb] p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef0ff] text-[#696cff]">{icon}</span>
      <span>
        <span className="block font-bold text-[#566a7f]">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-[#697a8d]">{text}</span>
      </span>
    </div>
  );
}
