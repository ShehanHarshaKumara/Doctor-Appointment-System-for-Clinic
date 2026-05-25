import { useState } from 'react';
import {
  Calendar,
  CreditCard,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { Appointment, User } from '../../lib/api';
import { StaffAppointmentsPage } from './pages/StaffAppointmentsPage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';
import { StaffMedicinesPage } from './pages/StaffMedicinesPage';
import { StaffPatientsPage } from './pages/StaffPatientsPage';
import { StaffPaymentsPage } from './pages/StaffPaymentsPage';
import { StaffProfilePage } from './pages/StaffProfilePage';

type StaffTab = 'dashboard' | 'appointments' | 'patients' | 'medicines' | 'payments' | 'profile';

export function StaffDashboard({ user, summary, appointments, onChanged, onUserChanged }: {
  user: User;
  summary: Record<string, number>;
  appointments: Appointment[];
  onChanged: () => void;
  onUserChanged?: (user: User) => void;
}) {
  const [activeTab, setActiveTab] = useState<StaffTab>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  const openTab = (tab: StaffTab) => {
    setActiveTab(tab);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="min-h-dvh w-full overflow-x-hidden bg-[#f5f5f9] text-[#384551]">
      {menuOpen && (
        <button
          type="button"
          aria-label="Close staff menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <div className="grid min-h-dvh w-full lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="sticky top-0 z-40 border-b border-[#e6e7ef] bg-white/95 px-3 py-3 shadow-sm backdrop-blur lg:h-dvh lg:border-b-0 lg:border-r lg:px-5 lg:py-5">
          <div className="flex min-h-12 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#14a6a1] text-white shadow-lg shadow-teal-100">
                <HeartPulse className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <strong className="block truncate text-xl text-[#566a7f]">Staff Panel</strong>
                <span className="block truncate text-xs font-semibold uppercase text-[#a1acb8]">Clinic Operations</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="grid h-11 w-11 place-items-center rounded-xl border border-[#eceef5] bg-[#fcfdff] text-[#697a8d] hover:bg-[#f5f5f9] lg:hidden"
              title={menuOpen ? 'Close staff menu' : 'Open staff menu'}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <nav className={`absolute left-3 right-3 top-[76px] z-50 max-h-[calc(100dvh-92px)] gap-2 overflow-y-auto rounded-2xl border border-[#eceef5] bg-white p-3 shadow-2xl shadow-slate-950/20 ${menuOpen ? 'grid' : 'hidden'} sm:grid sm:grid-cols-2 sm:shadow-[0_2px_6px_rgba(67,89,113,0.12)] lg:static lg:mt-8 lg:max-h-none lg:grid-cols-1 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>
            <StaffNavItem active={activeTab === 'dashboard'} icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" onClick={() => openTab('dashboard')} />
            <StaffNavItem active={activeTab === 'appointments'} icon={<Calendar className="h-5 w-5" />} label="Appointments" onClick={() => openTab('appointments')} />
            <StaffNavItem active={activeTab === 'patients'} icon={<Users className="h-5 w-5" />} label="Patients" onClick={() => openTab('patients')} />
            <StaffNavItem active={activeTab === 'medicines'} icon={<Pill className="h-5 w-5" />} label="Medicines" onClick={() => openTab('medicines')} />
            <StaffNavItem active={activeTab === 'payments'} icon={<CreditCard className="h-5 w-5" />} label="Payments" onClick={() => openTab('payments')} />
            <StaffNavItem active={activeTab === 'profile'} icon={<UserCog className="h-5 w-5" />} label="Profile" onClick={() => openTab('profile')} />
          </nav>

          <div className="mt-6 hidden rounded-2xl bg-[#e8fbf7] p-4 text-sm text-[#566a7f] lg:block">
            <p className="font-bold text-[#14a6a1]">Signed in staff</p>
            <p className="mt-2 truncate font-semibold">{user.name}</p>
            <p className="truncate text-[#697a8d]">{user.email}</p>
          </div>

          <div className="mt-4 hidden rounded-2xl border border-[#eceef5] bg-white p-4 text-sm text-[#697a8d] lg:block">
            <span className="inline-flex items-center gap-2 font-bold text-[#566a7f]">
              <LogOut className="h-4 w-4" />
              Use top logout
            </span>
            <p className="mt-2 leading-6">Staff access is limited to front desk workflows.</p>
          </div>
        </aside>

        <main className="min-w-0 px-3 py-3 sm:px-5 sm:py-5 lg:px-8">
          {activeTab === 'dashboard' && <StaffDashboardPage user={user} summary={summary} appointments={appointments} onNavigate={openTab} />}
          {activeTab === 'appointments' && <StaffAppointmentsPage appointments={appointments} onChanged={onChanged} />}
          {activeTab === 'patients' && <StaffPatientsPage onChanged={onChanged} />}
          {activeTab === 'medicines' && <StaffMedicinesPage onChanged={onChanged} />}
          {activeTab === 'payments' && <StaffPaymentsPage appointments={appointments} />}
          {activeTab === 'profile' && <StaffProfilePage user={user} onProfileChanged={onUserChanged} />}
        </main>
      </div>
    </section>
  );
}

function StaffNavItem({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-bold ${active ? 'bg-[#14a6a1] text-white shadow-lg shadow-teal-100' : 'text-[#697a8d] hover:bg-[#f5f5f9]'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
