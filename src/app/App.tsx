import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import {
  Activity,
  BadgeCheck,
  Calendar,
  ClipboardList,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  HeartPulse,
  House,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  Pill,
  Shield,
  Stethoscope,
  UserRound,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  api,
  Appointment,
  clearSession,
  Doctor,
  loadUser,
  Role,
  saveSession,
  SESSION_EXPIRED_EVENT,
  User,
  updateStoredUser,
} from './lib/api';
import { roleLabel } from './lib/roles';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import {
  PatientDoctorsPage,
  PatientHomePage,
  PatientMedicinesPage,
  PatientProfilePage,
  PatientReportsPage,
} from './pages/patient/PatientPages';
import { StaffDashboard } from './pages/staff/StaffDashboard';

type Page = 'home' | 'doctors' | 'services' | 'contact' | 'login' | 'register' | 'dashboard' | 'patient-home' | 'patient-doctors' | 'patient-appointment' | 'patient-medicine' | 'patient-reports' | 'patient-profile';

const demoAccounts = [
  ['Patient', 'patient@clinic.test'],
  ['Staff', 'staff@clinic.test'],
  ['Doctor', 'doctor@clinic.test'],
  ['Admin', 'admin@clinic.test'],
];

export default function App() {
  const [user, setUser] = useState<User | null>(() => loadUser());
  const [page, setPage] = useState<Page>(() => {
    const storedUser = loadUser();
    if (!storedUser) return 'login';
    return storedUser.role === 'patient' ? 'patient-home' : 'dashboard';
  });
  const [loginRole, setLoginRole] = useState<Role>('patient');

  const completeAuth = (nextUser: User) => {
    setUser(nextUser);
    setPage(nextUser.role === 'patient' ? 'patient-home' : 'dashboard');
  };

  useEffect(() => {
    const handleExpiredSession = (event: Event) => {
      const message = (event as CustomEvent<{ message?: string }>).detail?.message;
      clearSession();
      setUser(null);
      setPage('login');
      toast.error(message ?? 'Please sign in again.');
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpiredSession);

    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpiredSession);
  }, []);

  useEffect(() => {
    if (!user) return;

    api<{ user: User }>('/auth/me')
      .then((result) => setUser(result.user))
      .catch(() => {
        clearSession();
        setUser(null);
        setPage('login');
      });
  }, []);

  const navigate = (next: Page, role?: Role) => {
    if (role) setLoginRole(role);
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const logout = async () => {
    const logoutRequest = api('/auth/logout', { method: 'POST' });
    clearSession();
    setUser(null);
    setPage('login');

    try {
      await logoutRequest;
    } catch {
      // Local logout should still work if the API is unavailable.
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Toaster position="top-right" richColors />
      {user && user.role === 'patient' && <Header user={user} page={page} navigate={navigate} logout={logout} />}
      <main className={user && user.role === 'patient' ? 'pt-24 sm:pt-28' : ''}>
        {page === 'home' && <Home navigate={navigate} />}
        {page === 'doctors' && <DoctorsPage />}
        {page === 'services' && <ServicesPage />}
        {page === 'contact' && <ContactPage />}
        {page === 'login' && <StandaloneLoginPage role={loginRole} setRole={setLoginRole} initialMode="login" onLogin={completeAuth} onRegister={completeAuth} />}
        {page === 'register' && <StandaloneLoginPage role="patient" setRole={setLoginRole} initialMode="register" onLogin={completeAuth} onRegister={completeAuth} />}
        {page === 'dashboard' && (user ? <Dashboard user={user} logout={logout} onUserChanged={(nextUser) => {
          updateStoredUser(nextUser);
          setUser(nextUser);
        }} /> : <StandaloneLoginPage role={loginRole} setRole={setLoginRole} initialMode="login" onLogin={completeAuth} onRegister={completeAuth} />)}
        {user?.role === 'patient' && page === 'patient-home' && <PatientDashboardGate user={user} page="home" onProfileChanged={(nextUser) => {
          updateStoredUser(nextUser);
          setUser(nextUser);
        }} />}
        {user?.role === 'patient' && page === 'patient-doctors' && <PatientDashboardGate user={user} page="doctors" onProfileChanged={(nextUser) => {
          updateStoredUser(nextUser);
          setUser(nextUser);
        }} />}
        {user?.role === 'patient' && page === 'patient-appointment' && <PatientDashboardGate user={user} page="appointment" onProfileChanged={(nextUser) => {
          updateStoredUser(nextUser);
          setUser(nextUser);
        }} />}
        {user?.role === 'patient' && page === 'patient-medicine' && <PatientDashboardGate user={user} page="medicine" onProfileChanged={(nextUser) => {
          updateStoredUser(nextUser);
          setUser(nextUser);
        }} />}
        {user?.role === 'patient' && page === 'patient-reports' && <PatientDashboardGate user={user} page="reports" onProfileChanged={(nextUser) => {
          updateStoredUser(nextUser);
          setUser(nextUser);
        }} />}
        {user?.role === 'patient' && page === 'patient-profile' && <PatientDashboardGate user={user} page="profile" onProfileChanged={(nextUser) => {
          updateStoredUser(nextUser);
          setUser(nextUser);
        }} />}
      </main>
    </div>
  );
}

function Header({ user, page, navigate, logout }: {
  user: User | null;
  page: Page;
  navigate: (page: Page, role?: Role) => void;
  logout: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: 'patient-home', label: 'Home', icon: <House className="h-4 w-4" /> },
    { id: 'patient-doctors', label: 'Doctors', icon: <Stethoscope className="h-4 w-4" /> },
    { id: 'patient-appointment', label: 'Appointment', icon: <Calendar className="h-4 w-4" /> },
    { id: 'patient-medicine', label: 'Medicine', icon: <Pill className="h-4 w-4" /> },
    { id: 'patient-reports', label: 'Reports', icon: <FileText className="h-4 w-4" /> },
    { id: 'patient-profile', label: 'Profile', icon: <UserRound className="h-4 w-4" /> },
  ];
  const initials = user?.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'PT';

  const goTo = (next: Page) => {
    setMobileOpen(false);
    navigate(next);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="mx-auto w-full max-w-none">
        <div className="patient-nav-shell flex min-h-[72px] items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/80 px-3 shadow-2xl shadow-teal-950/10 backdrop-blur-xl sm:px-4">
          <button onClick={() => goTo(user ? 'patient-home' : 'login')} className="group flex min-w-0 items-center gap-3 rounded-2xl px-1 py-2 text-left">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-slate-950 via-teal-800 to-cyan-500 text-white shadow-lg shadow-teal-900/25 transition group-hover:-translate-y-0.5">
              <HeartPulse className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-black text-slate-950 sm:text-lg">CAMS Clinic</span>
              <span className="block truncate text-xs font-bold uppercase text-teal-700">Patient care portal</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 rounded-2xl bg-slate-100/80 p-1 xl:flex">
            {user && links.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => goTo(id)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-2xl px-3 text-sm font-bold transition ${page === id || (id === 'patient-home' && page === 'dashboard') ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200/80' : 'text-slate-500 hover:bg-white/70 hover:text-slate-900'}`}
              >
                {icon}
                {label}
              </button>
            ))}
          </nav>

          {user ? (
            <div className="hidden items-center gap-3 xl:flex">
              <button onClick={() => goTo('patient-profile')} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-teal-50 text-sm font-black text-teal-700">
                  {user.profile_image_url ? <img src={user.profile_image_url} alt="Patient profile" className="h-full w-full object-cover" /> : initials}
                </span>
                <span className="max-w-36 text-left">
                  <span className="block truncate text-sm font-black text-slate-950">{user.name}</span>
                  <span className="block truncate text-xs font-bold text-slate-500">Patient account</span>
                </span>
              </button>
              <button onClick={logout} className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-rose-600" title="Logout">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 xl:flex">
              <button onClick={() => goTo('register')} className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">
                Patient Register
              </button>
              <button onClick={() => goTo('login')} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/15">
                Login
              </button>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15 xl:hidden"
            title={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="patient-mobile-nav mt-2 rounded-3xl border border-white/70 bg-white/95 p-3 shadow-2xl shadow-slate-950/10 backdrop-blur-xl xl:hidden">
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-teal-100 text-sm font-black text-teal-800">
                {user?.profile_image_url ? <img src={user.profile_image_url} alt="Patient profile" className="h-full w-full object-cover" /> : initials}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-black text-slate-950">{user?.name ?? 'Patient'}</span>
                <span className="block truncate text-xs font-bold text-slate-500">{user?.email ?? 'Patient account'}</span>
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {user && links.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => goTo(id)}
                  className={`inline-flex min-h-12 items-center gap-3 rounded-2xl px-4 text-left text-sm font-bold transition ${page === id || (id === 'patient-home' && page === 'dashboard') ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-700 hover:bg-teal-50 hover:text-teal-800'}`}
                >
                  {icon}
                  {label}
                </button>
              ))}
              <button onClick={logout} className="inline-flex min-h-12 items-center gap-3 rounded-2xl bg-rose-50 px-4 text-left text-sm font-bold text-rose-700 hover:bg-rose-100 sm:col-span-2">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function PatientDashboardGate({ user, page, onProfileChanged }: {
  user: User;
  page: 'home' | 'doctors' | 'appointment' | 'medicine' | 'reports' | 'profile';
  onProfileChanged?: (user: User) => void;
}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    api<{ appointments: Appointment[] }>('/appointments').then((data) => setAppointments(data.appointments)).catch((error) => toast.error(error.message));
    api<{ summary: Record<string, number> }>('/dashboard/summary').then((data) => setSummary(data.summary)).catch(() => undefined);
  }, [refreshKey]);

  const props = {
    user,
    summary,
    appointments,
  };

  if (page === 'home') return <PatientHomePage {...props} />;
  if (page === 'doctors') return <PatientDoctorsPage />;
  if (page === 'appointment') return <PatientDashboard {...props} onChanged={() => setRefreshKey((key) => key + 1)} />;
  if (page === 'medicine') return <PatientMedicinesPage />;
  if (page === 'reports') return <PatientReportsPage {...props} />;
  return <PatientProfilePage {...props} onProfileChanged={onProfileChanged} />;
}

function Home({ navigate }: { navigate: (page: Page, role?: Role) => void }) {
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">Full-stack Laravel + React MVP</p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-slate-950 md:text-6xl">
              Clinic appointments, role dashboards, and doctor schedules in one working system.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-600">
              Patients can book online, staff can manage walk-in bookings, doctors can view schedules, and admins can monitor clinic activity.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => navigate('login', 'patient')} className="rounded-lg bg-teal-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-700">
                Patient login
              </button>
              <button onClick={() => navigate('login', 'doctor')} className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-slate-100">
                Doctor login
              </button>
              <button onClick={() => navigate('login', 'staff')} className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-slate-100">
                Staff login
              </button>
              <button onClick={() => navigate('register')} className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-slate-100">
                Patient register
              </button>
            </div>
            <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold">Demo password for all seeded accounts: password123</p>
              <div className="mt-2 grid gap-1 sm:grid-cols-2">
                {demoAccounts.map(([label, email]) => <span key={email}>{label}: {email}</span>)}
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop"
              alt="Clinic staff discussing patient care"
              className="h-[520px] w-full object-cover"
            />
          </div>
        </div>
      </section>
      <ServicesPage compact />
    </>
  );
}

function StandaloneLoginPage({ role, setRole, initialMode, onRegister, onLogin }: {
  role: Role;
  setRole: (role: Role) => void;
  initialMode: 'login' | 'register';
  onRegister: (user: User) => void;
  onLogin: (user: User) => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const accessCopy = {
    patient: {
      eyebrow: 'Separate Login',
      title: 'Sign in first, then open your patient web page.',
      detail: 'The patient website stays behind patient login so bookings, appointment history, and personal details open after authentication.',
      icon: <UserRound className="h-5 w-5" />,
      highlights: [
        ['Patient web', 'Book a doctor after patient login succeeds.', <Calendar className="h-5 w-5" />],
        ['Registration', 'New patients can create an account separately.', <UserPlus className="h-5 w-5" />],
      ],
    },
    doctor: {
      eyebrow: 'Separate Login',
      title: 'Sign in first, then open the doctor panel.',
      detail: 'Doctor schedules and visit updates open only after the doctor account passes role-checked login.',
      icon: <Stethoscope className="h-5 w-5" />,
      highlights: [
        ['Doctor panel', 'Review patients booked into your active schedule.', <Calendar className="h-5 w-5" />],
        ['Visit updates', 'Update appointment progress after login.', <ClipboardList className="h-5 w-5" />],
      ],
    },
    staff: {
      eyebrow: 'Separate Login',
      title: 'Sign in first, then open the staff panel.',
      detail: 'Staff login unlocks front desk booking, patient lookup, walk-ins, and appointment status work.',
      icon: <Users className="h-5 w-5" />,
      highlights: [
        ['Staff panel', 'Create quick appointments for front desk patients.', <UserPlus className="h-5 w-5" />],
        ['Clinic queue', 'Track pending visits after authentication.', <ClipboardList className="h-5 w-5" />],
      ],
    },
    admin: {
      eyebrow: 'Separate Login',
      title: 'Sign in first, then open admin controls.',
      detail: 'Admin login stays separate for dashboard monitoring, role work, and medicine inventory tools.',
      icon: <Shield className="h-5 w-5" />,
      highlights: [
        ['Role control', 'Keep clinic access separated by responsibility.', <Shield className="h-5 w-5" />],
        ['Medicine stock', 'Review inventory after admin login.', <Pill className="h-5 w-5" />],
      ],
    },
  }[role];
  const shellCopy = mode === 'register' ? {
    eyebrow: 'Patient Register',
    title: 'Create your patient account before booking online.',
    detail: 'Register from this first screen, then continue straight into the patient web page with your new account.',
    highlights: [
      ['New account', 'Save patient contact details and password once.', <UserPlus className="h-5 w-5" />],
      ['Patient web', 'Open booking tools after registration succeeds.', <Calendar className="h-5 w-5" />],
    ] as AuthHighlight[],
  } : accessCopy;

  return (
    <AuthShell eyebrow={shellCopy.eyebrow} title={shellCopy.title} detail={shellCopy.detail} highlights={shellCopy.highlights}>
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
        <button onClick={() => setMode('login')} className={`min-h-12 rounded-xl px-3 text-sm font-bold ${mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
          Login
        </button>
        <button onClick={() => {
          setRole('patient');
          setMode('register');
        }} className={`min-h-12 rounded-xl px-3 text-sm font-bold ${mode === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
          Register
        </button>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-white/70 p-1 shadow-sm sm:grid-cols-4">
        {(['patient', 'doctor', 'staff', 'admin'] as Role[]).map((item) => (
          <button
            key={item}
            disabled={mode === 'register' && item !== 'patient'}
            onClick={() => setRole(item)}
            className={`min-h-11 rounded-xl px-2 text-xs font-bold sm:text-sm ${role === item ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40'}`}
          >
            {roleLabel(item)}
          </button>
        ))}
      </div>
      <div key={`${mode}-${role}`} className="auth-form-swap">
        {mode === 'login' ? (
          <>
            <LoginForm
              role={role}
              title={`${roleLabel(role)} login`}
              detail={role === 'patient'
                ? 'Login opens the patient web page and booking tools.'
                : `Login opens the ${roleLabel(role).toLowerCase()} panel.`}
              icon={accessCopy.icon}
              onLogin={onLogin}
            />
            <AuthConfidence />
          </>
        ) : (
          <PatientRegisterForm onRegister={onRegister} />
        )}
      </div>
    </AuthShell>
  );
}

function LoginForm({ role, title, detail, icon, onLogin }: {
  role: Role;
  title: string;
  detail: string;
  icon: React.ReactNode;
  onLogin: (user: User) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const useDemoAccount = () => {
    setEmail({
      patient: 'patient@clinic.test',
      staff: 'staff@clinic.test',
      doctor: 'doctor@clinic.test',
      admin: 'admin@clinic.test',
    }[role]);
    setPassword('password123');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await api<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });
      saveSession(result.token, result.user);
      toast.success(`Welcome, ${result.user.name}`);
      onLogin(result.user);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-2 text-xs font-bold uppercase text-teal-700">
        {icon}
        Account sign in
      </span>
      <h2 className="mt-5 text-3xl font-bold text-slate-950">{title}</h2>
      <p className="mt-2 leading-7 text-slate-600">{detail}</p>
      <form onSubmit={submit} className="mt-7 grid gap-4">
        <AuthInput label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" placeholder="Enter your email" icon={<Mail className="h-5 w-5" />} />
        <AuthInput
          label="Password"
          value={password}
          onChange={setPassword}
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Enter your password"
          icon={<LockKeyhole className="h-5 w-5" />}
          action={(
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-teal-50 hover:text-teal-700"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        />
        <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2 font-semibold">
            <BadgeCheck className="h-4 w-4 text-teal-700" />
            Role-checked clinic access
          </span>
          <span className="text-slate-500">Demo password: password123</span>
        </div>
        <button disabled={loading} className="min-h-14 rounded-2xl bg-gradient-to-r from-teal-700 via-teal-600 to-sky-500 px-5 font-extrabold text-white shadow-lg shadow-teal-900/20 hover:brightness-105 disabled:opacity-60">
          {loading ? 'Signing in...' : 'Sign in securely'}
        </button>
      </form>
      {role !== 'admin' && (
        <button onClick={useDemoAccount} className="mt-3 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50">
          Use demo {roleLabel(role).toLowerCase()} account
        </button>
      )}
    </div>
  );
}

function PatientRegisterForm({ onRegister }: { onRegister: (user: User) => void }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    date_of_birth: '',
    gender: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await api<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      saveSession(result.token, result.user);
      toast.success('Patient account created');
      onRegister(result.user);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-2 text-xs font-bold uppercase text-teal-700">
        <UserPlus className="h-4 w-4" />
        Patient registration
      </span>
      <h2 className="mt-5 text-3xl font-bold text-slate-950">Create your account</h2>
      <p className="mt-2 leading-7 text-slate-600">Register once to book appointments and return to your patient dashboard.</p>
      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <AuthInput label="Full name" value={form.name} onChange={(name) => setForm({ ...form, name })} autoComplete="name" placeholder="Patient name" />
        <AuthInput label="Email" value={form.email} onChange={(email) => setForm({ ...form, email })} type="email" autoComplete="email" placeholder="name@example.com" />
        <AuthInput label="Phone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} type="tel" autoComplete="tel" placeholder="Phone number" />
        <AuthInput label="Date of birth" value={form.date_of_birth} onChange={(date_of_birth) => setForm({ ...form, date_of_birth })} type="date" required={false} />
        <AuthSelect
          label="Gender"
          value={form.gender}
          onChange={(gender) => setForm({ ...form, gender })}
          required={false}
          options={[
            { label: 'Select gender', value: '' },
            { label: 'Male', value: 'Male' },
            { label: 'Female', value: 'Female' },
          ]}
        />
        <AuthInput label="Address" value={form.address} onChange={(address) => setForm({ ...form, address })} required={false} autoComplete="street-address" placeholder="Optional" />
        <AuthInput label="Password" value={form.password} onChange={(password) => setForm({ ...form, password })} type="password" autoComplete="new-password" placeholder="Minimum 8 characters" />
        <AuthInput label="Confirm password" value={form.password_confirmation} onChange={(password_confirmation) => setForm({ ...form, password_confirmation })} type="password" autoComplete="new-password" placeholder="Repeat password" />
        <button disabled={loading} className="min-h-14 rounded-2xl bg-slate-950 px-5 font-extrabold text-white hover:bg-slate-800 disabled:opacity-60 sm:col-span-2">
          {loading ? 'Creating account...' : 'Create patient account'}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ user, logout, onUserChanged }: { user: User; logout: () => void; onUserChanged: (user: User) => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    api<{ appointments: Appointment[] }>('/appointments').then((data) => setAppointments(data.appointments)).catch((error) => toast.error(error.message));
    api<{ summary: Record<string, number> }>('/dashboard/summary').then((data) => setSummary(data.summary)).catch(() => undefined);
  }, [refreshKey]);

  if (user.role === 'admin') {
    return (
      <AdminDashboard
        user={user}
        summary={summary}
        appointments={appointments}
        logout={logout}
        onChanged={() => setRefreshKey((key) => key + 1)}
        onProfileChanged={onUserChanged}
      />
    );
  }

  const rolePageProps = {
    user,
    summary,
    appointments,
    onChanged: () => setRefreshKey((key) => key + 1),
    onUserChanged,
    logout,
  };

  if (user.role === 'patient') return <PatientHomePage user={user} summary={summary} appointments={appointments} />;
  if (user.role === 'staff') return <StaffDashboard {...rolePageProps} />;
  return <DoctorDashboard {...rolePageProps} />;
}

function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  useEffect(() => {
    api<{ doctors: Doctor[] }>('/doctors').then((data) => setDoctors(data.doctors)).catch((error) => toast.error(error.message));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <SectionHeading title="Doctors" subtitle="Browse seeded doctors from the Laravel API." />
      <div className="grid gap-5 md:grid-cols-3">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <Stethoscope className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">{doctor.full_name}</h3>
            <p className="font-semibold text-teal-700">{doctor.specialization}</p>
            <p className="mt-3 text-sm text-slate-600">{doctor.bio}</p>
            <p className="mt-4 text-sm font-semibold">Channel fee: Rs. {doctor.channel_fee}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServicesPage({ compact = false }: { compact?: boolean }) {
  const services = [
    ['Appointments', Calendar, 'Online and staff-assisted doctor channel booking.'],
    ['Patient Records', Users, 'Searchable patient profiles and appointment history.'],
    ['Doctor Schedules', Stethoscope, 'Doctor-specific slots with duplicate booking protection.'],
    ['Medicine Stock', Pill, 'Basic inventory with low-stock status.'],
    ['Health Tracking', Activity, 'Prepared data model for patient health logs and symptoms.'],
    ['Role Security', Shield, 'Separate patient, staff, doctor, and admin access.'],
  ];

  return (
    <section className={`${compact ? 'bg-slate-50' : ''} mx-auto max-w-7xl px-4 py-12`}>
      <SectionHeading title="Clinic Modules" subtitle="The MVP focuses on the appointment workflow first, with records and inventory ready for expansion." />
      <div className="grid gap-4 md:grid-cols-3">
        {services.map(([title, Icon, description]) => (
          <div key={String(title)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <Icon className="mb-4 h-7 w-7 text-teal-700" />
            <h3 className="font-bold">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <SectionHeading title="Contact" subtitle="Demo clinic contact information for the MVP." />
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="font-semibold">CAMS Clinic, Colombo</p>
        <p className="mt-2 text-slate-600">Phone: 077 100 0000</p>
        <p className="text-slate-600">Email: info@clinic.test</p>
        <p className="mt-4 text-sm text-slate-500">Connect this page to maps, SMS, and email notifications in a later phase.</p>
      </div>
    </section>
  );
}

type AuthHighlight = [string, string, React.ReactNode];

function AuthShell({ eyebrow, title, detail, highlights, children }: {
  eyebrow: string;
  title: string;
  detail: string;
  highlights: AuthHighlight[];
  children: React.ReactNode;
}) {
  return (
    <section className="auth-page-backdrop min-h-screen overflow-x-hidden sm:px-4 sm:py-6 lg:px-8">
      <div className="mx-auto grid min-h-screen max-w-7xl overflow-hidden border border-white/70 bg-white/72 shadow-2xl shadow-slate-950/25 backdrop-blur-xl sm:min-h-[720px] sm:rounded-[28px] lg:grid-cols-[1.05fr_0.95fr] lg:rounded-[32px]">
        <div className="relative isolate flex min-h-[290px] flex-col justify-between overflow-hidden bg-slate-950 px-5 py-6 text-white sm:min-h-[470px] sm:px-8 sm:py-8 lg:min-h-[720px] lg:px-10 lg:py-10">
          <img
            src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1400&auto=format&fit=crop"
            alt="Clinic reception and patient care"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(145deg,rgba(3,18,30,0.94),rgba(4,66,76,0.88)_52%,rgba(10,39,64,0.86))]" />
          <div>
            <div className="inline-flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10 shadow-xl shadow-slate-950/20">
                <HeartPulse className="h-8 w-8" />
              </span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-wide text-white/70">Clinic Appointment</span>
                <span className="block text-xl font-bold">CAMS Clinic</span>
              </span>
            </div>
          </div>

          <div className="my-5 sm:my-8 lg:my-9">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white/90">
              <Shield className="h-4 w-4 text-teal-200" />
              {eyebrow}
            </span>
            <h1 className="mt-5 max-w-xl text-2xl font-bold leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:mt-4 sm:text-base sm:leading-8">{detail}</p>

            <div className="mt-6 hidden gap-3 sm:grid sm:grid-cols-2 sm:gap-4 lg:mt-8">
              {highlights.map(([label, copy, icon]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-inner shadow-white/5">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-amber-200">{icon}</span>
                  <h2 className="mt-4 font-bold">{label}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/70">{copy}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 hidden flex-wrap gap-2 text-xs font-semibold text-white/85 sm:mt-7 sm:flex sm:gap-3 sm:text-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-3">
                <LockKeyhole className="h-4 w-4 text-teal-200" />
                Secure sessions
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-3">
                <Clock3 className="h-4 w-4 text-sky-200" />
                Fast role sign-in
              </span>
            </div>
          </div>

          <div className="hidden flex-col gap-2 border-t border-white/15 pt-5 text-sm text-white/70 sm:flex sm:flex-row sm:items-center sm:justify-between">
            <span>Clinic panel access is separated by role.</span>
            <span>Patient registration is open online.</span>
          </div>
        </div>

        <div className="auth-form-backdrop flex min-w-0 items-center px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
          <div className="mx-auto w-full min-w-0 max-w-xl">{children}</div>
        </div>
      </div>
    </section>
  );
}

function AuthConfidence() {
  return (
    <div className="mt-5 grid gap-3">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-700">
          <Shield className="h-5 w-5" />
        </span>
        <span>
          <strong className="block text-sm text-slate-950">Protected clinic access</strong>
          <span className="block text-sm text-slate-600">Login stays tied to the selected patient or staff role.</span>
        </span>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-50 text-sky-700">
          <Clock3 className="h-5 w-5" />
        </span>
        <span>
          <strong className="block text-sm text-slate-950">Quick return workflow</strong>
          <span className="block text-sm text-slate-600">Demo buttons fill the seeded account details for local testing.</span>
        </span>
      </div>
    </div>
  );
}

function AuthInput({ label, value, onChange, type = 'text', required = true, autoComplete, placeholder, icon, action }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-900">{label}</span>
      <span className="relative block">
        {icon && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`min-h-14 w-full rounded-2xl border border-slate-200 bg-white py-3 ${action ? 'pr-14' : 'pr-4'} ${icon ? 'pl-12' : 'pl-4'} font-semibold text-slate-950 outline-none shadow-sm transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100`}
        />
        {action && <span className="absolute right-2 top-1/2 -translate-y-1/2">{action}</span>}
      </span>
    </label>
  );
}

function AuthSelect({ label, value, onChange, required = true, options }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-900">{label}</span>
      <select
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-950 outline-none shadow-sm transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
      >
        {options.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold">{title}</h2>
      <p className="mt-2 max-w-2xl text-slate-600">{subtitle}</p>
    </div>
  );
}
