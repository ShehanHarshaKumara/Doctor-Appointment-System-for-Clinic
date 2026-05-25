import { CreditCard, FileText, ReceiptText, WalletCards } from 'lucide-react';
import { Appointment } from '../../../lib/api';

export function StaffPaymentsPage({ appointments }: { appointments: Appointment[] }) {
  const completed = appointments.filter((appointment) => appointment.status === 'completed').length;
  const pending = appointments.filter((appointment) => ['pending', 'confirmed', 'arrived', 'in_progress'].includes(appointment.status)).length;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_360px]">
      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
        <p className="text-sm font-bold text-[#14a6a1]">Payment page</p>
        <h1 className="mt-1 text-2xl font-bold text-[#566a7f]">Staff payments</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#697a8d]">
          Payment collection is prepared as a staff module. Connect this page to invoice, receipt, and checkout APIs when the backend payment tables are added.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <PaymentMetric icon={<ReceiptText className="h-5 w-5" />} label="Completed visits" value={completed} />
          <PaymentMetric icon={<FileText className="h-5 w-5" />} label="Open visits" value={pending} />
          <PaymentMetric icon={<WalletCards className="h-5 w-5" />} label="Ready module" value={1} />
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-[#eceef5]">
          <div className="bg-[#f5f5f9] px-4 py-3 text-xs font-bold uppercase text-[#a1acb8]">Payment workflow</div>
          <div className="grid gap-3 p-4">
            {['Select completed appointment', 'Generate bill and receipt', 'Record cash/card payment', 'Print or send receipt'].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-[#fcfdff] p-3 text-sm font-semibold text-[#566a7f]">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e8fbf7] text-[#14a6a1]">{index + 1}</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#e8fbf7] text-[#14a6a1]">
          <CreditCard className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-[#566a7f]">Next backend step</h2>
        <p className="mt-2 text-sm leading-6 text-[#697a8d]">
          Add payments table, payment controller, invoice number generation, and receipt print view to make this page fully transactional.
        </p>
      </section>
    </div>
  );
}

function PaymentMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[#f8f8fb] p-4">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#14a6a1]">{icon}</span>
      <p className="mt-3 text-xs font-bold uppercase text-[#a1acb8]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#566a7f]">{value}</p>
    </div>
  );
}
