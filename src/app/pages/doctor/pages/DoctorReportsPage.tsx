import { CheckCircle2, FileText, Stethoscope, Users } from 'lucide-react';
import { Appointment } from '../../../lib/api';

export function DoctorReportsPage({ appointments }: { appointments: Appointment[] }) {
  const completed = appointments.filter((appointment) => appointment.status === 'completed');
  const withNotes = appointments.filter((appointment) => appointment.doctor_notes);
  const uniquePatients = new Set(appointments.map((appointment) => appointment.patient.id)).size;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_360px]">
      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(16,24,40,0.10)]">
        <p className="text-sm font-bold text-[#2563eb]">Reports</p>
        <h1 className="mt-1 text-2xl font-bold text-[#344054]">Clinical report summary</h1>
        <p className="mt-2 text-sm leading-6 text-[#667085]">Review completed visits and doctor-note coverage. Add detailed notes from the My Schedule page.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <ReportMetric icon={<Users className="h-5 w-5" />} label="Patients seen" value={uniquePatients} />
          <ReportMetric icon={<CheckCircle2 className="h-5 w-5" />} label="Completed" value={completed.length} />
          <ReportMetric icon={<FileText className="h-5 w-5" />} label="Reports added" value={withNotes.length} />
        </div>
        <div className="mt-5 grid gap-3">
          {appointments.slice(0, 8).map((appointment) => (
            <article key={appointment.id} className="rounded-2xl border border-[#e6eaf2] bg-[#fcfdff] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="block font-bold text-[#344054]">{appointment.patient.full_name}</span>
                  <span className="block text-xs font-bold text-[#2563eb]">{appointment.appointment_no}</span>
                </span>
                <span className="text-sm font-semibold text-[#667085]">{appointment.appointment_date}</span>
              </div>
              <p className="mt-3 rounded-xl bg-white p-3 text-sm leading-6 text-[#667085]">{appointment.doctor_notes || 'No doctor report added yet.'}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(16,24,40,0.10)]">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#eef4ff] text-[#2563eb]"><Stethoscope className="h-6 w-6" /></span>
        <h2 className="mt-4 text-xl font-bold text-[#344054]">Add reports from schedule</h2>
        <p className="mt-2 text-sm leading-6 text-[#667085]">Open a patient in My Schedule, write doctor notes, then mark the appointment status. Those notes appear here as report records.</p>
      </section>
    </div>
  );
}

function ReportMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="rounded-xl bg-[#f8fafc] p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#2563eb]">{icon}</span><p className="mt-3 text-xs font-bold uppercase text-[#98a2b3]">{label}</p><p className="mt-1 text-2xl font-bold text-[#344054]">{value}</p></div>;
}
