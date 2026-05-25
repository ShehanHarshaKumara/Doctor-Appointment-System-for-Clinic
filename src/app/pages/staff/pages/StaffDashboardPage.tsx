import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock3,
  CreditCard,
  Pill,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Appointment, User } from '../../../lib/api';

type StaffTab = 'dashboard' | 'appointments' | 'patients' | 'medicines' | 'payments' | 'profile';

export function StaffDashboardPage({ user, summary, appointments, onNavigate }: {
  user: User;
  summary: Record<string, number>;
  appointments: Appointment[];
  onNavigate: (tab: StaffTab) => void;
}) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayQueue = appointments
    .filter((appointment) => appointment.appointment_date === todayKey)
    .sort((a, b) => a.time_slot.localeCompare(b.time_slot));
  const activeQueue = appointments.filter((appointment) => ['pending', 'confirmed', 'arrived', 'in_progress'].includes(appointment.status));
  const completedVisits = summary.completed_appointments ?? appointments.filter((appointment) => appointment.status === 'completed').length;
  const pendingAppointments = summary.pending_appointments ?? appointments.filter((appointment) => appointment.status === 'pending').length;
  const totalTracked = Math.max(appointments.length, pendingAppointments + completedVisits);
  const completionRate = totalTracked ? Math.round((completedVisits / totalTracked) * 100) : 0;
  const nextVisit = todayQueue.find((appointment) => ['pending', 'confirmed', 'arrived', 'in_progress'].includes(appointment.status));
  const weeklyTrend = buildWeeklyTrend(appointments);
  const statusMix = buildStatusMix(appointments, summary);
  const statusChart = statusMix.some((item) => item.value > 0)
    ? statusMix
    : [{ name: 'No visits', value: 1, color: '#eceef5' }];

  return (
    <div className="grid gap-4 sm:gap-5">
      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
        <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#e8fbf7] px-3 py-2 text-xs font-bold uppercase text-[#14a6a1]">
                <Sparkles className="h-4 w-4" />
                Smart staff workspace
              </span>
              <span className="rounded-full bg-[#f5f5f9] px-3 py-2 text-xs font-bold text-[#697a8d]">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-bold leading-tight text-[#566a7f] sm:text-4xl">
              Good day, {firstName(user.name)}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#697a8d] sm:text-base">
              Keep today&apos;s queue moving, create appointments fast, and watch patient and medicine activity from one clean staff command center.
            </p>
            <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
              <PrimaryAction icon={<Plus className="h-4 w-4" />} label="New appointment" onClick={() => onNavigate('appointments')} />
              <SecondaryAction icon={<Search className="h-4 w-4" />} label="Find patient" onClick={() => onNavigate('patients')} />
              <SecondaryAction icon={<Pill className="h-4 w-4" />} label="Check stock" onClick={() => onNavigate('medicines')} />
            </div>
          </div>

          <div className="rounded-2xl bg-[#f8f8fb] p-4">
            <p className="text-xs font-bold uppercase text-[#a1acb8]">Next active visit</p>
            {nextVisit ? (
              <div className="mt-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-lg font-bold text-[#566a7f]">{nextVisit.patient.full_name}</span>
                    <span className="mt-1 block text-sm font-semibold text-[#14a6a1]">{nextVisit.appointment_no}</span>
                  </span>
                  <StatusBadge status={nextVisit.status} />
                </div>
                <div className="mt-4 grid gap-2 text-sm text-[#697a8d]">
                  <InfoLine icon={<Clock3 className="h-4 w-4" />} text={`${nextVisit.appointment_date} at ${nextVisit.time_slot}`} />
                  <InfoLine icon={<Users className="h-4 w-4" />} text={nextVisit.doctor.full_name} />
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[#697a8d]">No active visit is waiting for today.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SmartMetric icon={<Users className="h-5 w-5" />} label="Patients" value={summary.total_patients ?? 0} detail="Registered records" tone="teal" />
        <SmartMetric icon={<Calendar className="h-5 w-5" />} label="Today" value={summary.today_appointments ?? todayQueue.length} detail="Scheduled visits" tone="blue" />
        <SmartMetric icon={<Activity className="h-5 w-5" />} label="Waiting" value={activeQueue.length} detail={`${pendingAppointments} pending`} tone="amber" />
        <SmartMetric icon={<TrendingUp className="h-5 w-5" />} label="Resolved" value={completionRate} suffix="%" detail={`${completedVisits} completed`} tone="green" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <div className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[#14a6a1]">Clinic trend</p>
              <h2 className="mt-1 text-xl font-bold text-[#566a7f]">Weekly appointments chart</h2>
              <p className="mt-1 text-sm text-[#a1acb8]">Last 7 calendar days from visible bookings.</p>
            </div>
            <span className="inline-flex min-h-10 items-center rounded-xl bg-[#e8fbf7] px-3 text-sm font-bold text-[#14a6a1]">
              {weeklyTrend.reduce((total, item) => total + item.visits, 0)} visits
            </span>
          </div>
          <div className="mt-5 h-[260px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="staffWeeklyVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14a6a1" stopOpacity={0.34} />
                    <stop offset="100%" stopColor="#14a6a1" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eceef5" strokeDasharray="4 4" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#a1acb8', fontSize: 12 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#a1acb8', fontSize: 12 }} />
                <Tooltip contentStyle={{ border: '1px solid #eceef5', borderRadius: 14, boxShadow: '0 10px 30px rgba(67,89,113,0.14)' }} />
                <Area type="monotone" dataKey="visits" name="Appointments" stroke="#14a6a1" strokeWidth={3} fill="url(#staffWeeklyVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
          <p className="text-sm font-bold text-[#14a6a1]">Status mix</p>
          <h2 className="mt-1 text-xl font-bold text-[#566a7f]">Queue chart</h2>
          <div className="mt-4 h-[210px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusChart} dataKey="value" innerRadius={58} outerRadius={88} paddingAngle={statusChart.length > 1 ? 4 : 0} stroke="none">
                  {statusChart.map((item) => <Cell key={item.name} fill={item.color} />)}
                </Pie>
                <Tooltip contentStyle={{ border: '1px solid #eceef5', borderRadius: 14, boxShadow: '0 10px 30px rgba(67,89,113,0.14)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid gap-2">
            {statusMix.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 rounded-xl bg-[#f8f8fb] px-3 py-2">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate text-sm font-bold text-[#697a8d]">{item.name}</span>
                </span>
                <strong className="text-sm text-[#566a7f]">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#14a6a1]">Workload chart</p>
            <h2 className="mt-1 text-xl font-bold text-[#566a7f]">Daily visit volume</h2>
          </div>
          <button onClick={() => onNavigate('appointments')} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#f8f8fb] px-3 text-sm font-bold text-[#697a8d] hover:bg-[#e8fbf7] hover:text-[#14a6a1]">
            View appointments
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 h-[220px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyTrend} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#eceef5" strokeDasharray="4 4" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#a1acb8', fontSize: 12 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#a1acb8', fontSize: 12 }} />
              <Tooltip contentStyle={{ border: '1px solid #eceef5', borderRadius: 14, boxShadow: '0 10px 30px rgba(67,89,113,0.14)' }} />
              <Bar dataKey="visits" name="Visits" fill="#14a6a1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
          <div className="flex flex-col gap-3 border-b border-[#eceef5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[#14a6a1]">Live queue</p>
              <h2 className="text-xl font-bold text-[#566a7f]">Today&apos;s appointments</h2>
            </div>
            <button onClick={() => onNavigate('appointments')} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#e8fbf7] px-3 text-sm font-bold text-[#14a6a1]">
              Open
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 p-4">
            {(todayQueue.length ? todayQueue : appointments.slice(0, 6)).map((appointment) => (
              <article key={appointment.id} className="grid gap-3 rounded-2xl border border-[#eceef5] bg-[#fcfdff] p-4 md:grid-cols-[minmax(0,1fr)_150px_130px] md:items-center">
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white font-bold text-[#14a6a1]">
                      {appointment.patient.full_name.charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-[#566a7f]">{appointment.patient.full_name}</span>
                      <span className="mt-0.5 block text-xs font-bold text-[#14a6a1]">{appointment.appointment_no}</span>
                      <span className="mt-1 block truncate text-sm text-[#697a8d]">{appointment.doctor.full_name}</span>
                    </span>
                  </div>
                </div>
                <InfoLine icon={<Clock3 className="h-4 w-4" />} text={`${appointment.appointment_date} ${appointment.time_slot}`} />
                <StatusBadge status={appointment.status} />
              </article>
            ))}
            {appointments.length === 0 && <p className="py-10 text-center text-[#a1acb8]">No appointments yet.</p>}
          </div>
        </div>

        <div className="grid gap-5">
          <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
            <p className="text-sm font-bold text-[#14a6a1]">Smart actions</p>
            <div className="mt-4 grid gap-2">
              <QuickAction icon={<Calendar className="h-4 w-4" />} label="Book appointment" detail="Create patient visit" onClick={() => onNavigate('appointments')} />
              <QuickAction icon={<Users className="h-4 w-4" />} label="Patient lookup" detail="Search records" onClick={() => onNavigate('patients')} />
              <QuickAction icon={<CreditCard className="h-4 w-4" />} label="Payment desk" detail="Prepare billing" onClick={() => onNavigate('payments')} />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
            <p className="text-sm font-bold text-[#14a6a1]">Attention</p>
            <div className="mt-4 grid gap-3">
              <AlertItem
                icon={<AlertTriangle className="h-4 w-4" />}
                title="Low stock medicines"
                value={summary.low_stock_medicines ?? 0}
                onClick={() => onNavigate('medicines')}
              />
              <AlertItem
                icon={<CheckCircle2 className="h-4 w-4" />}
                title="Completed visits"
                value={completedVisits}
                onClick={() => onNavigate('appointments')}
              />
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function SmartMetric({ icon, label, value, suffix = '', detail, tone }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  detail: string;
  tone: 'teal' | 'blue' | 'amber' | 'green';
}) {
  const palette = {
    teal: 'bg-[#e8fbf7] text-[#14a6a1]',
    blue: 'bg-[#e7f8ff] text-[#03a6cf]',
    amber: 'bg-[#fff2d6] text-[#ffab00]',
    green: 'bg-[#e8fadf] text-[#5bbf22]',
  }[tone];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_2px_6px_rgba(67,89,113,0.12)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${palette}`}>{icon}</span>
        <span className="rounded-full bg-[#f8f8fb] px-2 py-1 text-xs font-bold text-[#a1acb8]">Live</span>
      </div>
      <p className="mt-4 text-sm font-semibold text-[#697a8d]">{label}</p>
      <p className="mt-1 text-3xl font-bold text-[#566a7f]">{value}{suffix}</p>
      <p className="mt-1 text-xs font-semibold text-[#a1acb8]">{detail}</p>
    </div>
  );
}

function PrimaryAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#14a6a1] px-4 text-sm font-bold text-white shadow-lg shadow-teal-100">
      {icon}
      {label}
    </button>
  );
}

function SecondaryAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d9dee3] bg-white px-4 text-sm font-bold text-[#697a8d] hover:bg-[#f8f8fb]">
      {icon}
      {label}
    </button>
  );
}

function QuickAction({ icon, label, detail, onClick }: { icon: React.ReactNode; label: string; detail: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex min-h-14 items-center gap-3 rounded-xl bg-[#f8f8fb] px-3 text-left hover:bg-[#e8fbf7]">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-[#14a6a1]">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-[#566a7f]">{label}</span>
        <span className="block truncate text-xs font-semibold text-[#a1acb8]">{detail}</span>
      </span>
    </button>
  );
}

function AlertItem({ icon, title, value, onClick }: { icon: React.ReactNode; title: string; value: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between gap-3 rounded-xl bg-[#f8f8fb] p-3 text-left hover:bg-[#fff9ec]">
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-[#ffab00]">{icon}</span>
        <span className="truncate text-sm font-bold text-[#566a7f]">{title}</span>
      </span>
      <strong className="text-lg text-[#566a7f]">{value}</strong>
    </button>
  );
}

function InfoLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-[#697a8d]">
      <span className="shrink-0 text-[#14a6a1]">{icon}</span>
      <span className="truncate">{text}</span>
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const palette = {
    pending: 'bg-[#fff2d6] text-[#ffab00]',
    confirmed: 'bg-[#e7f8ff] text-[#03a6cf]',
    arrived: 'bg-[#eef0ff] text-[#696cff]',
    in_progress: 'bg-[#eef0ff] text-[#696cff]',
    completed: 'bg-[#e8fadf] text-[#5bbf22]',
    cancelled: 'bg-[#fff0ed] text-[#ff3e1d]',
    no_show: 'bg-[#fff0ed] text-[#ff3e1d]',
  }[status] ?? 'bg-[#f5f5f9] text-[#697a8d]';

  return <span className={`inline-flex min-h-8 items-center justify-center rounded-lg px-2 text-xs font-bold capitalize ${palette}`}>{status.replace(/_/g, ' ')}</span>;
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || 'Staff';
}

function buildWeeklyTrend(appointments: Appointment[]) {
  const today = startOfDay(new Date());
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
