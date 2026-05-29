import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Package, Pill, Search } from 'lucide-react';
import { toast } from 'sonner';
import { api, Medicine } from '../../../lib/api';

export function DoctorMedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api<{ medicines: Medicine[] }>('/medicines')
      .then((data) => setMedicines(data.medicines))
      .catch((error) => toast.error(error.message));
  }, []);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return medicines;
    return medicines.filter((medicine) => [medicine.name, medicine.medicine_no, medicine.generic_name, medicine.category, medicine.supplier].some((value) => value?.toLowerCase().includes(query)));
  }, [medicines, search]);

  const totalStock = medicines.reduce((total, medicine) => total + Number(medicine.stock_qty || 0), 0);
  const lowStock = medicines.filter((medicine) => medicine.status === 'low_stock').length;

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(16,24,40,0.10)]">
        <p className="text-sm font-bold text-[#2563eb]">Medicine inventory</p>
        <h1 className="mt-1 text-2xl font-bold text-[#344054]">Medical stock view</h1>
        <p className="mt-1 text-sm text-[#667085]">Doctors can view available stock, low-stock alerts, expiry dates, and dosage forms.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <StockMetric icon={<Pill className="h-5 w-5" />} label="Medicines" value={medicines.length} />
          <StockMetric icon={<Package className="h-5 w-5" />} label="Total stock" value={totalStock} />
          <StockMetric icon={<AlertTriangle className="h-5 w-5" />} label="Low stock" value={lowStock} />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(16,24,40,0.10)]">
        <div className="border-b border-[#e6eaf2] p-5">
          <label className="flex min-h-12 items-center gap-2 rounded-xl bg-[#f8fafc] px-3 text-[#667085]">
            <Search className="h-4 w-4" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search medicine, category, supplier" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </label>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((medicine) => (
            <article key={medicine.id} className="rounded-2xl border border-[#e6eaf2] bg-[#fcfdff] p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate font-bold text-[#344054]">{medicine.name}</span>
                  <span className="block text-xs font-bold text-[#2563eb]">{medicine.medicine_no}</span>
                </span>
                <span className={`rounded-lg px-2 py-1 text-xs font-bold capitalize ${medicine.status === 'low_stock' ? 'bg-[#fff2d6] text-[#ffab00]' : medicine.status === 'expired' ? 'bg-[#fff0ed] text-[#ff3e1d]' : 'bg-[#e8fadf] text-[#5bbf22]'}`}>{medicine.status.replace(/_/g, ' ')}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <MedicineFact label="Stock" value={`${medicine.stock_qty}`} />
                <MedicineFact label="Alert at" value={`${medicine.low_stock_threshold}`} />
                <MedicineFact label="Form" value={medicine.dosage_form ?? 'Not set'} />
                <MedicineFact label="Expiry" value={medicine.expiry_date ?? 'Not set'} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function StockMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="rounded-xl bg-[#f8fafc] p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#2563eb]">{icon}</span><p className="mt-3 text-xs font-bold uppercase text-[#98a2b3]">{label}</p><p className="mt-1 text-2xl font-bold text-[#344054]">{value}</p></div>;
}

function MedicineFact({ label, value }: { label: string; value: string }) {
  return <span className="rounded-xl bg-white px-3 py-2"><span className="block text-xs font-bold uppercase text-[#98a2b3]">{label}</span><span className="block truncate font-semibold text-[#344054]">{value}</span></span>;
}
