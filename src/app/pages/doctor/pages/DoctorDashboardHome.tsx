import { Activity, CalendarDays, Clock3, FileText, Pill, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Appointment, User } from '../../../lib/api';

type DoctorTab = 'dashboard' | 'schedule' | 'medicines' | 'reports' | 'profile';

export function DoctorDashboardHome({ user, summary, appointments, onNavigate }: {
  user: User;
  summary: Record<string, number>;
  appointments: Appointment[];
  onNavigate: (tab: DoctorTab) => void;
}) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayPatients = appointments.filter((appointment) => appointment.appointment_date === todayKey);
  const waiting = todayPatients.filter((appointment) => ['pending', 'confirmed', 'arrived', 'in_progress'].includes(appointment.status));
  const completed = appointments.filter((appointment) => appointment.status === 'completed').length;
  const chartData = buildWeeklyTrend(appointments);

  return (
    <div className="grid gap-5">
      <section className="grid gap-5 rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(16,24,40,0.10)] sm:p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <p className="text-sm font-bold text-[#2563eb]">Doctor dashboard</p>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-[#344054] sm:text-4xl">Welcome, Dr. {user.name.replace(/^Dr\.\s*/i, '')}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085] sm:text-base">
            Review today&apos;s patient load, open your schedule, check medicine inventory, and prepare clinical reports from one full-screen workspace.
          </p>
          <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
            <DoctorAction label="Open my schedule" icon={<CalendarDays className="h-4 w-4" />} onClick={() => onNavigate('schedule')} primary />
            <DoctorAction label="Medicine stock" icon={<Pill className="h-4 w-4" />} onClick={() => onNavigate('medicines')} />
            <DoctorAction label="Reports" icon={<FileText className="h-4 w-4" />} onClick={() => onNavigate('reports')} />
          </div>
        </div>

        <div className="rounded-2xl bg-[#eef4ff] p-4">
          <p className="text-xs font-bold uppercase text-[#667085]">Today patient stay</p>
          <p className="mt-3 text-5xl font-bold text-[#2563eb]">{todayPatients.length}</p>
          <p className="mt-2 text-sm font-semibold text-[#344054]">{waiting.length} active / waiting patients today</p>
          <p className="mt-4 text-sm leading-6 text-[#667085]">Use My Schedule to view patient details, symptoms, phone, appointment status, and doctor notes.</p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DoctorMetric icon={<Users className="h-5 w-5" />} label="Today patients" value={todayPatients.length} detail="Scheduled for today" />
        <DoctorMetric icon={<Clock3 className="h-5 w-5" />} label="Waiting" value={waiting.length} detail="Needs attention" />
        <DoctorMetric icon={<Activity className="h-5 w-5" />} label="Completed" value={completed} detail="Finished visits" />
        <DoctorMetric icon={<Pill className="h-5 w-5" />} label="Low stock" value={summary.low_stock_medicines ?? 0} detail="Inventory alerts" />
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(16,24,40,0.10)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#2563eb]">Patient flow</p>
            <h2 className="mt-1 text-xl font-bold text-[#344054]">Weekly schedule chart</h2>
          </div>
          <span className="rounded-xl bg-[#eef4ff] px-3 py-2 text-sm font-bold text-[#2563eb]">{appointments.length} visible visits</span>
        </div>
        <div className="mt-5 h-[260px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e6eaf2" strokeDasharray="4 4" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 12 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 12 }} />
              <Tooltip contentStyle={{ border: '1px solid #e6eaf2', borderRadius: 14, boxShadow: '0 10px 30px rgba(16,24,40,0.14)' }} />
              <Bar dataKey="visits" name="Patients" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function DoctorMetric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: number; detail: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(16,24,40,0.10)]">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eef4ff] text-[#2563eb]">{icon}</span>
      <p className="mt-4 text-sm font-semibold text-[#667085]">{label}</p>
      <p className="mt-1 text-3xl font-bold text-[#344054]">{value}</p>
      <p className="mt-1 text-xs font-semibold text-[#98a2b3]">{detail}</p>
    </div>
  );
}

function DoctorAction({ icon, label, onClick, primary = false }: { icon: React.ReactNode; label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button onClick={onClick} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold ${primary ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-100' : 'border border-[#d0d5dd] bg-white text-[#667085] hover:bg-[#f8fafc]'}`}>
      {icon}
      {label}
    </button>
  );
}

function buildWeeklyTrend(appointments: Appointment[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return {
      key: dateKey(date),
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      visits: 0,
    };
  });
  const byDay = new Map(days.map((day) => [day.key, day]));
  appointments.forEach((appointment) => {
    const bucket = byDay.get(appointment.appointment_date);
    if (bucket) bucket.visits += 1;
  });
  return days.map(({ label, visits }) => ({ label, visits }));
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
