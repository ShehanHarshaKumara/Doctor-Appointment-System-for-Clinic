import { useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  HeartPulse,
  LogOut,
  Menu,
  Pill,
  Stethoscope,
  UserCog,
  X,
} from 'lucide-react';
import { Appointment, User } from '../../lib/api';
import { DoctorDashboardHome } from './pages/DoctorDashboardHome';
import { DoctorMedicinesPage } from './pages/DoctorMedicinesPage';
import { DoctorProfilePage } from './pages/DoctorProfilePage';
import { DoctorReportsPage } from './pages/DoctorReportsPage';
import { DoctorSchedulePage } from './pages/DoctorSchedulePage';

type DoctorTab = 'dashboard' | 'schedule' | 'medicines' | 'reports' | 'profile';

export function DoctorDashboard({ user, summary, appointments, onChanged, onUserChanged, logout }: {
  user: User;
  summary: Record<string, number>;
  appointments: Appointment[];
  onChanged: () => void;
  onUserChanged?: (user: User) => void;
  logout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DoctorTab>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  const openTab = (tab: DoctorTab) => {
    setActiveTab(tab);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="min-h-dvh w-full overflow-x-hidden bg-[#f5f7fb] text-[#344054]">
      {menuOpen && (
        <button
          type="button"
          aria-label="Close doctor menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <div className="grid min-h-dvh w-full lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="sticky top-0 z-40 border-b border-[#e6eaf2] bg-white/95 px-3 py-3 shadow-sm backdrop-blur lg:h-dvh lg:border-b-0 lg:border-r lg:px-5 lg:py-5">
          <div className="flex min-h-12 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#2563eb] text-white shadow-lg shadow-blue-100">
                <HeartPulse className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <strong className="block truncate text-xl text-[#344054]">Doctor Panel</strong>
                <span className="block truncate text-xs font-semibold uppercase text-[#98a2b3]">Clinical Workspace</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="grid h-11 w-11 place-items-center rounded-xl border border-[#e6eaf2] bg-[#f8fafc] text-[#667085] hover:bg-[#eef4ff] lg:hidden"
              title={menuOpen ? 'Close doctor menu' : 'Open doctor menu'}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <nav className={`absolute left-3 right-3 top-[76px] z-50 max-h-[calc(100dvh-92px)] gap-2 overflow-y-auto rounded-2xl border border-[#e6eaf2] bg-white p-3 shadow-2xl shadow-slate-950/20 ${menuOpen ? 'grid' : 'hidden'} sm:grid sm:grid-cols-2 lg:static lg:mt-8 lg:max-h-none lg:grid-cols-1 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>
            <DoctorNavItem active={activeTab === 'dashboard'} icon={<BarChart3 className="h-5 w-5" />} label="Dashboard" onClick={() => openTab('dashboard')} />
            <DoctorNavItem active={activeTab === 'schedule'} icon={<CalendarDays className="h-5 w-5" />} label="My Schedule" onClick={() => openTab('schedule')} />
            <DoctorNavItem active={activeTab === 'medicines'} icon={<Pill className="h-5 w-5" />} label="Medicines" onClick={() => openTab('medicines')} />
            <DoctorNavItem active={activeTab === 'reports'} icon={<Stethoscope className="h-5 w-5" />} label="Reports" onClick={() => openTab('reports')} />
            <DoctorNavItem active={activeTab === 'profile'} icon={<UserCog className="h-5 w-5" />} label="Profile" onClick={() => openTab('profile')} />
            <button type="button" onClick={logout} className="flex min-h-12 w-full items-center gap-3 rounded-xl bg-[#fff0ed] px-4 text-left text-sm font-bold text-[#ff3e1d] hover:bg-[#ffe4dd] sm:col-span-2 lg:col-span-1">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </nav>

          <div className="mt-6 hidden rounded-2xl bg-[#eef4ff] p-4 text-sm text-[#344054] lg:block">
            <p className="font-bold text-[#2563eb]">Signed in doctor</p>
            <p className="mt-2 truncate font-semibold">{user.name}</p>
            <p className="truncate text-[#667085]">{user.email}</p>
          </div>
        </aside>

        <main className="min-w-0 px-3 py-3 sm:px-5 sm:py-5 lg:px-8">
          {activeTab === 'dashboard' && <DoctorDashboardHome user={user} summary={summary} appointments={appointments} onNavigate={openTab} />}
          {activeTab === 'schedule' && <DoctorSchedulePage appointments={appointments} onChanged={onChanged} />}
          {activeTab === 'medicines' && <DoctorMedicinesPage />}
          {activeTab === 'reports' && <DoctorReportsPage appointments={appointments} />}
          {activeTab === 'profile' && <DoctorProfilePage user={user} onProfileChanged={onUserChanged} />}
        </main>
      </div>
    </section>
  );
}

function DoctorNavItem({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-bold ${active ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-100' : 'text-[#667085] hover:bg-[#eef4ff] hover:text-[#2563eb]'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
