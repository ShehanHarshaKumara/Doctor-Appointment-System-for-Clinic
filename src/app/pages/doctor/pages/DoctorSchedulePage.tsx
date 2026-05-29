import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, FileText, Mail, MapPin, Phone, Stethoscope, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { api, Appointment } from '../../../lib/api';

const statusOptions = ['pending', 'confirmed', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show'];

export function DoctorSchedulePage({ appointments, onChanged }: { appointments: Appointment[]; onChanged: () => void }) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const [dateFilter, setDateFilter] = useState('');
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [notes, setNotes] = useState('');

  const visible = useMemo(() => {
    return appointments
      .filter((appointment) => !dateFilter || appointment.appointment_date === dateFilter)
      .sort((a, b) => `${a.appointment_date} ${a.time_slot}`.localeCompare(`${b.appointment_date} ${b.time_slot}`));
  }, [appointments, dateFilter]);

  useEffect(() => {
    if (!selected && visible[0]) {
      setSelected(visible[0]);
      setNotes(visible[0].doctor_notes ?? '');
    }
  }, [selected, visible]);

  const todayCount = appointments.filter((appointment) => appointment.appointment_date === todayKey).length;

  const openPatient = (appointment: Appointment) => {
    setSelected(appointment);
    setNotes(appointment.doctor_notes ?? '');
  };

  const updateAppointment = async (appointment: Appointment, status: string) => {
    try {
      const result = await api<{ appointment: Appointment }>(`/appointments/${appointment.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, doctor_notes: notes }),
      });
      setSelected(result.appointment);
      toast.success('Appointment updated');
      onChanged();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(16,24,40,0.10)]">
        <div className="flex flex-col gap-3 border-b border-[#e6eaf2] p-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#2563eb]">My Schedule</p>
            <h1 className="mt-1 text-2xl font-bold text-[#344054]">Patient appointments</h1>
            <p className="mt-1 text-sm text-[#667085]">{todayCount} patients stay today. {appointments.length} total appointment records visible.</p>
          </div>
          <div className="grid gap-2 sm:flex sm:items-end">
            <label>
              <span className="mb-1 block text-sm font-bold text-[#667085]">Date</span>
              <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="min-h-11 rounded-xl border border-[#d0d5dd] px-3 outline-none focus:border-[#2563eb]" />
            </label>
            <button type="button" onClick={() => setDateFilter(todayKey)} className="min-h-11 rounded-xl bg-[#eef4ff] px-4 text-sm font-bold text-[#2563eb]">Today</button>
            <button type="button" onClick={() => setDateFilter('')} className="min-h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold text-[#667085]">All</button>
          </div>
        </div>

        <div className="grid gap-3 p-4">
          {visible.map((appointment) => (
            <button key={appointment.id} onClick={() => openPatient(appointment)} className={`rounded-2xl border p-4 text-left ${selected?.id === appointment.id ? 'border-[#2563eb] bg-[#eef4ff]' : 'border-[#e6eaf2] bg-[#fcfdff]'}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0">
                  <span className="block truncate font-bold text-[#344054]">{appointment.patient.full_name}</span>
                  <span className="block text-xs font-bold text-[#2563eb]">{appointment.appointment_no}</span>
                </span>
                <StatusBadge status={appointment.status} />
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[#667085] sm:grid-cols-3">
                <Info icon={<Clock3 className="h-4 w-4" />} text={`${appointment.appointment_date} ${appointment.time_slot}`} />
                <Info icon={<Phone className="h-4 w-4" />} text={appointment.patient.phone ?? 'No phone'} />
                <Info icon={<FileText className="h-4 w-4" />} text={appointment.reason ?? 'No reason added'} />
              </div>
              <span className="mt-3 inline-flex min-h-9 items-center rounded-xl bg-white px-3 text-xs font-bold text-[#2563eb]">
                View patient appointment details
              </span>
            </button>
          ))}
          {visible.length === 0 && <p className="py-10 text-center text-[#98a2b3]">No appointments for this date.</p>}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(16,24,40,0.10)]">
        {selected ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <span>
                <p className="text-sm font-bold text-[#2563eb]">Patient appointment details</p>
                <p className="mt-1 text-xs font-semibold text-[#98a2b3]">{selected.appointment_no}</p>
              </span>
              <StatusBadge status={selected.status} />
            </div>
            <div className="mt-4 flex items-start gap-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#eef4ff] font-bold text-[#2563eb]">{selected.patient.full_name.charAt(0)}</span>
              <span className="min-w-0">
                <h2 className="truncate text-xl font-bold text-[#344054]">{selected.patient.full_name}</h2>
                <p className="text-sm text-[#667085]">{selected.patient.patient_no}</p>
              </span>
            </div>
            <div className="mt-5 grid gap-3 text-sm">
              <Detail icon={<Phone className="h-4 w-4" />} label="Phone" value={selected.patient.phone ?? 'Not set'} />
              <Detail icon={<Mail className="h-4 w-4" />} label="Email" value={selected.patient.email ?? 'Not set'} />
              <Detail icon={<UserRound className="h-4 w-4" />} label="Gender" value={selected.patient.gender ?? 'Not set'} />
              <Detail icon={<MapPin className="h-4 w-4" />} label="Address" value={selected.patient.address ?? 'Not set'} />
              <Detail icon={<CalendarDays className="h-4 w-4" />} label="Appointment" value={`${selected.appointment_date} at ${selected.time_slot}`} />
              <Detail icon={<Stethoscope className="h-4 w-4" />} label="Reason" value={selected.reason ?? 'No reason added'} />
              <Detail icon={<FileText className="h-4 w-4" />} label="Allergies" value={selected.patient.allergies ?? 'Not recorded'} />
              <Detail icon={<UserRound className="h-4 w-4" />} label="Blood type" value={selected.patient.blood_type ?? 'Not recorded'} />
            </div>
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-bold text-[#667085]">Doctor notes / report</span>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} className="w-full rounded-xl border border-[#d0d5dd] bg-white px-3 py-2 outline-none focus:border-[#2563eb]" />
            </label>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {statusOptions.map((status) => (
                <button key={status} onClick={() => updateAppointment(selected, status)} className="min-h-10 rounded-xl bg-[#eef4ff] px-3 text-sm font-bold capitalize text-[#2563eb] hover:bg-[#dbeafe]">
                  {status.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="py-10 text-center text-[#98a2b3]">Select a patient appointment to view details.</p>
        )}
      </section>
    </div>
  );
}

function Info({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <span className="inline-flex min-w-0 items-center gap-2"><span className="text-[#2563eb]">{icon}</span><span className="truncate">{text}</span></span>;
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <span className="flex gap-2 rounded-xl bg-[#f8fafc] p-3">
      <span className="mt-0.5 text-[#2563eb]">{icon}</span>
      <span><span className="block text-xs font-bold uppercase text-[#98a2b3]">{label}</span><span className="block break-words font-semibold text-[#344054]">{value}</span></span>
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = status === 'completed' ? 'bg-[#e8fadf] text-[#5bbf22]' : status === 'cancelled' || status === 'no_show' ? 'bg-[#fff0ed] text-[#ff3e1d]' : 'bg-[#eef4ff] text-[#2563eb]';
  return <span className={`inline-flex min-h-8 items-center rounded-lg px-2 text-xs font-bold capitalize ${color}`}>{status.replace(/_/g, ' ')}</span>;
}
