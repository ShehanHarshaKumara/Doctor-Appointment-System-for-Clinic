import { useEffect, useState } from 'react';
import {
  Activity,
  BadgeCheck,
  Bell,
  Calendar,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Clock3,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Package,
  Pill,
  Search,
  Settings,
  Shield,
  Stethoscope,
  TrendingUp,
  UserRoundCog,
  UserRoundPlus,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';
import { api, Appointment, Medicine, User } from '../../lib/api';
import { AdminAppointmentsPage } from './AdminAppointmentsPage';
import { AdminDoctorsPage } from './AdminDoctorsPage';
import { AdminMedicinesPage } from './AdminMedicinesPage';
import { AdminPatientsPage } from './AdminPatientsPage';
import { AdminProfilePage } from './AdminProfilePage';
import { AdminStaffPage } from './AdminStaffPage';

const statusOptions = ['pending', 'confirmed', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show'];

type AdminUser = Pick<User, 'id' | 'name' | 'email' | 'phone' | 'role'> & {
  is_active: boolean;
  created_at: string;
};

export function AdminDashboard({ user, summary, appointments, logout, onChanged, onProfileChanged }: {
  user: User;
  summary: Record<string, number>;
  appointments: Appointment[];
  logout: () => void;
  onChanged: () => void;
  onProfileChanged: (user: User) => void;
}) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'patients' | 'doctors' | 'staff' | 'medicines' | 'access' | 'profile'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const openTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  const adminMetrics = [
    ['Patients', summary.total_patients ?? 0, Users, 'Patient records'],
    ['Doctors', summary.total_doctors ?? 0, Stethoscope, 'Clinic specialists'],
    ['Today', summary.today_appointments ?? 0, Calendar, 'Appointments'],
    ['Low Stock', summary.low_stock_medicines ?? 0, Package, 'Medicines'],
  ] as const;
  const handledAppointments = summary.completed_appointments ?? appointments.filter((appointment) => appointment.status === 'completed').length;
  const visibleAppointments = Math.max(appointments.length, (summary.pending_appointments ?? 0) + handledAppointments);
  const completionRate = visibleAppointments ? Math.round((handledAppointments / visibleAppointments) * 100) : 0;

  return (
    <section className="min-h-dvh w-full overflow-x-hidden bg-[#f5f5f9] text-[#384551]">
      <div className={`grid min-h-dvh w-full min-w-0 transition-[grid-template-columns] duration-300 ${sidebarCollapsed ? 'lg:grid-cols-[88px_minmax(0,1fr)]' : 'lg:grid-cols-[260px_minmax(0,1fr)]'}`}>
        <aside className={`min-w-0 overflow-hidden border-b border-[#e6e7ef] bg-white px-3 py-3 shadow-sm transition-all duration-300 sm:px-4 sm:py-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r ${sidebarCollapsed ? 'lg:px-3' : 'lg:px-5'}`}>
          <div className="flex items-center justify-between gap-3">
            <div className={`flex items-center gap-3 px-1 sm:px-2 ${sidebarCollapsed ? 'lg:justify-center lg:px-0' : ''}`}>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#696cff] text-white shadow-lg shadow-indigo-200">
                <HeartPulse className="h-6 w-6" />
              </span>
              <span className={sidebarCollapsed ? 'lg:hidden' : ''}>
                <strong className="block text-xl text-[#566a7f]">CAMS</strong>
                <span className="block text-xs font-semibold uppercase text-[#a1acb8]">Admin Console</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen((open) => !open)}
              className="grid h-11 w-11 place-items-center rounded-xl border border-[#eceef5] bg-[#fcfdff] text-[#697a8d] hover:bg-[#f5f5f9] lg:hidden"
              title={mobileSidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            className={`mt-4 hidden min-h-11 items-center rounded-xl border border-[#eceef5] bg-[#fcfdff] px-3 text-sm font-bold text-[#697a8d] hover:bg-[#f5f5f9] lg:flex ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {!sidebarCollapsed && <span>Collapse menu</span>}
            {sidebarCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </button>

          <nav className={`mt-3 w-full min-w-0 max-w-full gap-2 pb-1 sm:mt-6 sm:grid-cols-3 sm:pb-0 lg:mt-6 lg:grid lg:grid-cols-1 ${mobileSidebarOpen ? 'grid' : 'hidden'} sm:grid ${sidebarCollapsed ? 'lg:gap-3' : ''}`}>
            <AdminNavItem collapsed={sidebarCollapsed} active={activeTab === 'dashboard'} icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" onClick={() => openTab('dashboard')} />
            <AdminNavItem collapsed={sidebarCollapsed} active={activeTab === 'appointments'} icon={<Calendar className="h-5 w-5" />} label="Appointments" onClick={() => openTab('appointments')} />
            <AdminNavItem collapsed={sidebarCollapsed} active={activeTab === 'patients'} icon={<Users className="h-5 w-5" />} label="Patients" onClick={() => openTab('patients')} />
            <AdminNavItem collapsed={sidebarCollapsed} active={activeTab === 'doctors'} icon={<Stethoscope className="h-5 w-5" />} label="Doctors" onClick={() => openTab('doctors')} />
            <AdminNavItem collapsed={sidebarCollapsed} active={activeTab === 'staff'} icon={<UserRoundPlus className="h-5 w-5" />} label="Staff" onClick={() => openTab('staff')} />
            <AdminNavItem collapsed={sidebarCollapsed} active={activeTab === 'medicines'} icon={<Pill className="h-5 w-5" />} label="Medicines" onClick={() => openTab('medicines')} />
            <AdminNavItem collapsed={sidebarCollapsed} active={activeTab === 'access'} icon={<Shield className="h-5 w-5" />} label="Access" onClick={() => openTab('access')} />
            <AdminNavItem collapsed={sidebarCollapsed} active={activeTab === 'profile'} icon={<Settings className="h-5 w-5" />} label="Profile" onClick={() => openTab('profile')} />
          </nav>

          <div className={`mt-6 hidden rounded-2xl bg-[#f1f2ff] p-4 text-sm text-[#566a7f] lg:mt-auto ${sidebarCollapsed ? 'lg:hidden' : 'lg:block'}`}>
            <p className="font-bold text-[#696cff]">Clinic status</p>
            <p className="mt-2 leading-6">Role-based panels are connected to the Laravel clinic API.</p>
          </div>
        </aside>

        <div className="min-w-0 px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="flex flex-col gap-3 rounded-2xl bg-white px-3 py-3 shadow-[0_2px_6px_rgba(67,89,113,0.12)] sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-4">
            <label className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl bg-[#f5f5f9] px-4 text-[#a1acb8] sm:max-w-xl">
              <Search className="h-5 w-5 shrink-0" />
              <span className="truncate text-sm font-semibold">
                {activeTab === 'dashboard' && 'Clinic dashboard overview'}
                {activeTab === 'appointments' && 'Search and schedule appointments'}
                {activeTab === 'patients' && 'Patients central directory'}
                {activeTab === 'doctors' && 'Practitioner schedules and availability'}
                {activeTab === 'staff' && 'Staff accounts and front desk permissions'}
                {activeTab === 'medicines' && 'Medicine inventory and thresholds'}
                {activeTab === 'access' && 'Security roles and credentials'}
                {activeTab === 'profile' && 'Admin profile and account settings'}
              </span>
            </label>
            <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-3 sm:justify-end">
              <button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#566a7f] hover:bg-[#f5f5f9] sm:h-11 sm:w-11" title="Notifications">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-[#f5f5f9] px-3 py-2 sm:flex-none">
                <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#71dd37] font-bold text-white">
                  {user.profile_image_url ? <img src={user.profile_image_url} alt="Admin profile" className="h-full w-full object-cover" /> : user.name.charAt(0)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-[#566a7f]">{user.name}</span>
                  <span className="block text-xs text-[#a1acb8]">Administrator</span>
                </span>
              </div>
              <button onClick={logout} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#ff3e1d] hover:bg-[#fff0ed] sm:h-11 sm:w-11" title="Logout">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Conditional Rendering of Dashboard vs. Other tabs */}
          {activeTab === 'dashboard' && (
            <>
              <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-5 2xl:grid-cols-[minmax(0,1.5fr)_minmax(420px,0.8fr)]">
                <div className="relative min-w-0 overflow-hidden rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)] sm:p-6">
                  <div className="relative z-10 max-w-xl">
                    <p className="text-sm font-bold text-[#696cff]">Welcome back</p>
                    <h1 className="mt-2 text-2xl font-bold text-[#566a7f] sm:text-3xl">Clinic performance dashboard</h1>
                    <p className="mt-3 max-w-lg break-words text-sm leading-6 text-[#697a8d] sm:text-base sm:leading-7">
                      Track appointment flow, medicine attention, and patient service from one admin command view.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
                      <span className="inline-flex items-center gap-2 rounded-lg bg-[#eef0ff] px-3 py-2 text-xs font-bold text-[#696cff] sm:text-sm">
                        <TrendingUp className="h-4 w-4" />
                        {summary.pending_appointments ?? 0} pending visits
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-lg bg-[#e8fadf] px-3 py-2 text-xs font-bold text-[#71dd37] sm:text-sm">
                        <HeartPulse className="h-4 w-4" />
                        Clinic active
                      </span>
                    </div>
                  </div>
                  <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-3 xl:max-w-xl">
                    <HeroSignal icon={<Clock3 className="h-4 w-4" />} label="Queue" value={`${summary.pending_appointments ?? 0} waiting`} tone="indigo" />
                    <HeroSignal icon={<BadgeCheck className="h-4 w-4" />} label="Handled" value={`${handledAppointments} completed`} tone="green" />
                    <HeroSignal icon={<Activity className="h-4 w-4" />} label="Service" value={`${completionRate}% resolved`} tone="amber" />
                  </div>
                  <div className="pointer-events-none absolute -right-8 bottom-0 z-0 hidden h-56 w-56 rounded-full bg-[#eef0ff] xl:block" />
                  <span className="pointer-events-none absolute bottom-5 right-10 z-0 hidden h-28 w-28 items-center justify-center rounded-[32px] bg-[#696cff] text-white shadow-2xl shadow-indigo-200 xl:flex">
                    <ClipboardList className="h-14 w-14" />
                  </span>
                </div>

                <div className="grid min-w-0 grid-cols-[repeat(2,minmax(0,1fr))] gap-3 sm:gap-4">
                  {adminMetrics.map(([label, value, Icon, caption]) => (
                    <AdminMetricCard key={label} label={label} value={value} caption={caption} icon={<Icon className="h-5 w-5" />} />
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
                <AppointmentTrend appointments={appointments} summary={summary} />
                <AppointmentStatusMix appointments={appointments} summary={summary} />
              </div>

              <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(350px,0.85fr)]">
                <AdminAppointments appointments={appointments} onChanged={onChanged} />
                <AdminTools onChanged={onChanged} />
              </div>
            </>
          )}

          {activeTab === 'appointments' && (
            <AdminAppointmentsPage
              appointments={appointments}
              onChanged={onChanged}
            />
          )}

          {activeTab === 'patients' && (
            <AdminPatientsPage onChanged={onChanged} />
          )}

          {activeTab === 'doctors' && (
            <AdminDoctorsPage onChanged={onChanged} />
          )}

          {activeTab === 'staff' && (
            <AdminStaffPage onChanged={onChanged} />
          )}

          {activeTab === 'medicines' && (
            <AdminMedicinesPage onChanged={onChanged} />
          )}

          {activeTab === 'access' && (
            <AdminUsers />
          )}

          {activeTab === 'profile' && (
            <AdminProfilePage user={user} onProfileChanged={onProfileChanged} />
          )}
        </div>
      </div>
    </section>
  );
}

function HeroSignal({ icon, label, value, tone }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'indigo' | 'green' | 'amber';
}) {
  const palette = {
    indigo: 'bg-[#f0f1ff] text-[#696cff]',
    green: 'bg-[#e8fadf] text-[#5bbf22]',
    amber: 'bg-[#fff2d6] text-[#ffab00]',
  }[tone];

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#eceef5] bg-[#fcfdff] p-3">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${palette}`}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-[11px] font-bold uppercase text-[#a1acb8]">{label}</span>
        <span className="block truncate text-sm font-bold text-[#566a7f]">{value}</span>
      </span>
    </div>
  );
}

function AdminNavItem({ active = false, collapsed = false, icon, label, onClick }: { active?: boolean; collapsed?: boolean; icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex w-full min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-bold sm:min-h-12 sm:gap-3 sm:px-4 sm:text-sm ${collapsed ? 'lg:justify-center lg:px-0' : ''} ${active ? 'bg-[#696cff] text-white shadow-lg shadow-indigo-100' : 'text-[#697a8d] hover:bg-[#f5f5f9]'}`}
    >
      {icon}
      <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
    </button>
  );
}

function AdminMetricCard({ label, value, caption, icon }: { label: string; value: number; caption: string; icon: React.ReactNode }) {
  return (
    <div className="group min-w-0 rounded-2xl bg-white p-4 shadow-[0_2px_6px_rgba(67,89,113,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(67,89,113,0.14)] sm:p-5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef0ff] text-[#696cff] sm:h-11 sm:w-11">{icon}</span>
      <p className="mt-3 truncate text-xs font-semibold text-[#697a8d] sm:mt-4 sm:text-sm">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#566a7f] sm:text-2xl">{value}</p>
      <p className="mt-1 truncate text-[11px] text-[#a1acb8] sm:text-xs">{caption}</p>
    </div>
  );
}

function AppointmentTrend({ appointments, summary }: { appointments: Appointment[]; summary: Record<string, number> }) {
  const trendData = buildAppointmentTrend(appointments);
  const trendTotal = trendData.reduce((total, item) => total + item.visits, 0);

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[#696cff]">Appointments</p>
          <h2 className="mt-1 text-xl font-bold text-[#566a7f]">Weekly clinic trend</h2>
          <p className="mt-1 text-sm text-[#a1acb8]">Last 7 calendar days from visible bookings.</p>
        </div>
        <div className="rounded-2xl bg-[#f5f5f9] px-4 py-3 text-right">
          <p className="text-xs font-bold uppercase text-[#a1acb8]">Tracked visits</p>
          <p className="text-2xl font-bold text-[#566a7f]">{trendTotal}</p>
        </div>
      </div>

      <div className="mt-5 h-[250px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="clinicVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#696cff" stopOpacity={0.34} />
                <stop offset="100%" stopColor="#696cff" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#eceef5" strokeDasharray="4 4" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#a1acb8', fontSize: 12 }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#a1acb8', fontSize: 12 }} />
            <Tooltip
              cursor={{ stroke: '#696cff', strokeOpacity: 0.16 }}
              contentStyle={{ border: '1px solid #eceef5', borderRadius: 14, boxShadow: '0 10px 30px rgba(67,89,113,0.14)' }}
            />
            <Area type="monotone" dataKey="visits" name="Appointments" stroke="#696cff" strokeWidth={3} fill="url(#clinicVisits)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid gap-3 border-t border-[#eceef5] pt-4 sm:grid-cols-3">
        <ChartFact label="Today" value={summary.today_appointments ?? 0} />
        <ChartFact label="Pending" value={summary.pending_appointments ?? 0} />
        <ChartFact label="Completed" value={summary.completed_appointments ?? 0} />
      </div>
    </div>
  );
}

function AppointmentStatusMix({ appointments, summary }: { appointments: Appointment[]; summary: Record<string, number> }) {
  const statusData = buildStatusMix(appointments, summary);
  const chartData = statusData.some((item) => item.value > 0)
    ? statusData
    : [{ name: 'No visits yet', value: 1, color: '#eceef5', placeholder: true }];
  const countedVisits = statusData.reduce((total, item) => total + item.value, 0);

  return (
    <div className="min-w-0 rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)] sm:p-6">
      <div>
        <p className="text-sm font-bold text-[#696cff]">Queue quality</p>
        <h2 className="mt-1 text-xl font-bold text-[#566a7f]">Visit status mix</h2>
        <p className="mt-1 text-sm text-[#a1acb8]">A quick view of current appointment flow.</p>
      </div>

      <div className="mt-4 grid items-center gap-4 sm:grid-cols-[190px_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[190px_minmax(0,1fr)]">
        <div className="relative mx-auto h-[190px] w-[190px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" innerRadius={62} outerRadius={86} paddingAngle={chartData.length > 1 ? 4 : 0} stroke="none">
                {chartData.map((item) => <Cell key={item.name} fill={item.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ border: '1px solid #eceef5', borderRadius: 14, boxShadow: '0 10px 30px rgba(67,89,113,0.14)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <span>
              <strong className="block text-3xl text-[#566a7f]">{countedVisits}</strong>
              <span className="block text-xs font-semibold uppercase text-[#a1acb8]">Visits</span>
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          {statusData.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-3 rounded-xl bg-[#f8f8fb] px-3 py-2.5">
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate text-sm font-semibold text-[#697a8d]">{item.name}</span>
              </span>
              <strong className="text-sm text-[#566a7f]">{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChartFact({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[#f8f8fb] px-3 py-3">
      <p className="text-xs font-bold uppercase text-[#a1acb8]">{label}</p>
      <p className="mt-1 text-lg font-bold text-[#566a7f]">{value}</p>
    </div>
  );
}

function AdminAppointments({ appointments, onChanged }: { appointments: Appointment[]; onChanged: () => void }) {
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
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
      <div className="flex flex-col gap-2 border-b border-[#eceef5] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#566a7f]">Appointment activity</h2>
          <p className="text-sm text-[#a1acb8]">Recent visits and status controls</p>
        </div>
        <span className="rounded-lg bg-[#fff2d6] px-3 py-2 text-xs font-bold text-[#ffab00]">{appointments.length} records</span>
      </div>
      <div className="grid gap-3 p-4 md:hidden">
        {appointments.slice(0, 8).map((appointment) => (
          <div key={appointment.id} className="rounded-xl border border-[#eceef5] bg-[#fcfdff] p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="block break-all text-sm font-bold text-[#696cff]">{appointment.appointment_no}</span>
                <span className="block text-xs text-[#a1acb8]">{appointment.appointment_date} at {appointment.time_slot}</span>
              </span>
              <select value={appointment.status} onChange={(event) => updateStatus(appointment, event.target.value)} className="max-w-[128px] rounded-lg border border-[#d9dee3] bg-white px-2 py-2 text-xs font-semibold text-[#566a7f]">
                {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div className="mt-3 grid gap-2 rounded-xl bg-white p-3 text-sm">
              <span>
                <span className="block text-xs font-bold uppercase text-[#a1acb8]">Patient</span>
                <span className="font-semibold text-[#566a7f]">{appointment.patient.full_name}</span>
              </span>
              <span>
                <span className="block text-xs font-bold uppercase text-[#a1acb8]">Doctor</span>
                <span>{appointment.doctor.full_name}</span>
              </span>
            </div>
          </div>
        ))}
        {appointments.length === 0 && <p className="py-6 text-center text-[#a1acb8]">No appointment records yet.</p>}
      </div>
      <div className="hidden md:block">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-[#f5f5f9] text-xs font-bold uppercase text-[#a1acb8]">
            <tr>
              <th className="w-[25%] px-5 py-4">Appointment</th>
              <th className="w-[19%]">Patient</th>
              <th className="w-[19%]">Doctor</th>
              <th className="w-[18%]">Date</th>
              <th className="w-[19%]">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.slice(0, 8).map((appointment) => (
              <tr key={appointment.id} className="border-t border-[#eceef5]">
                <td className="px-5 py-4">
                  <span className="block break-all font-bold text-[#696cff]">{appointment.appointment_no}</span>
                  <span className="text-xs text-[#a1acb8]">{appointment.time_slot}</span>
                </td>
                <td className="break-words pr-2 font-semibold text-[#566a7f]">{appointment.patient.full_name}</td>
                <td className="break-words pr-2">{appointment.doctor.full_name}</td>
                <td className="break-words pr-2">{appointment.appointment_date}</td>
                <td>
                  <select value={appointment.status} onChange={(event) => updateStatus(appointment, event.target.value)} className="w-full rounded-lg border border-[#d9dee3] bg-white px-2 py-2 font-semibold text-[#566a7f]">
                    {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && <p className="px-5 py-10 text-center text-[#a1acb8]">No appointment records yet.</p>}
      </div>
    </div>
  );
}

function AdminTools({ onChanged }: { onChanged: () => void }) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    api<{ medicines: Medicine[] }>('/medicines').then((data) => setMedicines(data.medicines)).catch(() => undefined);
  }, []);

  const addMedicine = async () => {
    if (!name) return;
    try {
      const result = await api<{ medicine: Medicine }>('/medicines', {
        method: 'POST',
        body: JSON.stringify({ name, category: 'General', stock_qty: 25, unit_price: 10 }),
      });
      setMedicines([result.medicine, ...medicines]);
      setName('');
      onChanged();
      toast.success('Medicine added');
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#566a7f]">Medicine inventory</h2>
          <p className="text-sm text-[#a1acb8]">Quick add and stock watch</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e8fadf] text-[#71dd37]">
          <Pill className="h-5 w-5" />
        </span>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Medicine name" className="min-h-12 min-w-0 flex-1 rounded-xl border border-[#d9dee3] bg-[#fcfdff] px-3 py-2 outline-none focus:border-[#696cff]" />
        <button onClick={addMedicine} className="min-h-12 rounded-xl bg-[#696cff] px-4 py-2 font-bold text-white shadow-lg shadow-indigo-100">Add</button>
      </div>
      <div className="mt-5 space-y-3">
        {medicines.slice(0, 5).map((medicine) => (
          <div key={medicine.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#eceef5] px-3 py-3 text-sm">
            <span className="min-w-0">
              <span className="block truncate font-bold text-[#566a7f]">{medicine.name}</span>
              <span className="block text-xs text-[#a1acb8]">{medicine.medicine_no} - stock {medicine.stock_qty}</span>
            </span>
            <span className={`rounded-lg px-2 py-1 text-xs font-bold ${medicine.status === 'low_stock' ? 'bg-[#fff2d6] text-[#ffab00]' : 'bg-[#e8fadf] text-[#71dd37]'}`}>
              {medicine.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    api<{ users: AdminUser[] }>('/users').then((data) => setUsers(data.users)).catch(() => undefined);
  }, []);

  return (
    <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
      <div className="flex flex-col gap-3 border-b border-[#eceef5] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[#696cff]">Access control</p>
          <h2 className="mt-1 text-xl font-bold text-[#566a7f]">User accounts</h2>
          <p className="mt-1 text-sm text-[#a1acb8]">Passwords stay hashed and are never shown in admin views.</p>
        </div>
        <span className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#eef0ff] px-3 text-sm font-bold text-[#696cff]">
          <UserRoundCog className="h-5 w-5" />
          {users.length} users
        </span>
      </div>

      <div className="grid gap-3 p-4 md:hidden">
        {users.map((user) => (
          <div key={user.id} className="rounded-xl border border-[#eceef5] bg-[#fcfdff] p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="block truncate font-bold text-[#566a7f]">{user.name}</span>
                <span className="block break-all text-sm text-[#697a8d]">{user.email}</span>
              </span>
              <RoleBadge role={user.role} />
            </div>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <AccountFact label="Phone" value={user.phone ?? 'Not set'} />
              <AccountFact label="Status" value={user.is_active ? 'Active' : 'Inactive'} />
              <AccountFact label="Password" value="Protected hash" />
              <AccountFact label="Created" value={formatAdminDate(user.created_at)} />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="bg-[#f5f5f9] text-xs font-bold uppercase text-[#a1acb8]">
            <tr>
              <th className="px-5 py-4">User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Password</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-[#eceef5]">
                <td className="px-5 py-4 font-bold text-[#566a7f]">{user.name}</td>
                <td className="break-all pr-3 text-[#697a8d]">{user.email}</td>
                <td className="pr-3">{user.phone ?? 'Not set'}</td>
                <td className="pr-3"><RoleBadge role={user.role} /></td>
                <td className="pr-3">
                  <span className={`rounded-lg px-2 py-1 text-xs font-bold ${user.is_active ? 'bg-[#e8fadf] text-[#5bbf22]' : 'bg-[#fff0ed] text-[#ff3e1d]'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="pr-3">
                  <span className="rounded-lg bg-[#eef0ff] px-2 py-1 text-xs font-bold text-[#696cff]">Protected hash</span>
                </td>
                <td className="pr-5 text-[#697a8d]">{formatAdminDate(user.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && <p className="px-5 py-8 text-center text-[#a1acb8]">No user accounts loaded.</p>}
    </div>
  );
}

function RoleBadge({ role }: { role: AdminUser['role'] }) {
  return <span className="rounded-lg bg-[#f5f5f9] px-2 py-1 text-xs font-bold capitalize text-[#566a7f]">{role}</span>;
}

function AccountFact({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-xl bg-white px-3 py-2">
      <span className="block text-[11px] font-bold uppercase text-[#a1acb8]">{label}</span>
      <span className="block break-words font-semibold text-[#566a7f]">{value}</span>
    </span>
  );
}

function formatAdminDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function PlaceholderTab({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
      <span className="mb-4 grid h-20 w-20 place-items-center rounded-2xl bg-[#f1f2ff]">{icon}</span>
      <h3 className="text-lg font-bold text-[#566a7f]">{title}</h3>
      <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#a1acb8]">{description}</p>
      <button disabled className="mt-6 rounded-xl bg-[#696cff]/10 px-4 py-2 text-xs font-bold text-[#696cff] cursor-not-allowed">
        Feature Expansion Underway
      </button>
    </div>
  );
}

function buildAppointmentTrend(appointments: Appointment[]) {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      date,
      key: dateKey(date),
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      visits: 0,
    };
  });
  const visitsByDay = new Map(days.map((day) => [day.key, day]));

  appointments.forEach((appointment) => {
    const bucket = visitsByDay.get(appointment.appointment_date);
    if (bucket) bucket.visits += 1;
  });

  return days.map(({ label, visits }) => ({ label, visits }));
}

function buildStatusMix(appointments: Appointment[], summary: Record<string, number>) {
  const counts = appointments.reduce<Record<string, number>>((result, appointment) => {
    result[appointment.status] = (result[appointment.status] ?? 0) + 1;
    return result;
  }, {});

  counts.pending = Math.max(counts.pending ?? 0, summary.pending_appointments ?? 0);
  counts.completed = Math.max(counts.completed ?? 0, summary.completed_appointments ?? 0);

  return [
    { name: 'Pending', value: counts.pending ?? 0, color: '#ffab00' },
    { name: 'Confirmed', value: counts.confirmed ?? 0, color: '#03c3ec' },
    { name: 'In progress', value: (counts.arrived ?? 0) + (counts.in_progress ?? 0), color: '#696cff' },
    { name: 'Completed', value: counts.completed ?? 0, color: '#71dd37' },
    { name: 'Cancelled', value: (counts.cancelled ?? 0) + (counts.no_show ?? 0), color: '#ff3e1d' },
  ];
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
