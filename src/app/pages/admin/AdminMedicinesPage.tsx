import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
  CircleDollarSign,
  Eye,
  Package,
  PencilLine,
  Pill,
  Plus,
  Search,
  Trash2,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { confirmDelete, showSuccess } from '../../lib/alerts';
import { api, Medicine } from '../../lib/api';

type MedicineForm = {
  name: string;
  generic_name: string;
  category: string;
  dosage_form: string;
  stock_qty: string;
  low_stock_threshold: string;
  unit_price: string;
  expiry_date: string;
  supplier: string;
};

const emptyForm: MedicineForm = {
  name: '',
  generic_name: '',
  category: '',
  dosage_form: '',
  stock_qty: '0',
  low_stock_threshold: '10',
  unit_price: '0',
  expiry_date: '',
  supplier: '',
};

export function AdminMedicinesPage({ onChanged }: { onChanged: () => void }) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [activeView, setActiveView] = useState<'inventory' | 'form' | 'details'>('inventory');
  const [form, setForm] = useState<MedicineForm>(emptyForm);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const detailsRef = useRef<HTMLElement | null>(null);

  const loadMedicines = async () => {
    const data = await api<{ medicines: Medicine[] }>('/medicines');
    setMedicines(data.medicines);
    return data.medicines;
  };

  const viewMedicine = async (medicine: Medicine, reveal = false) => {
    const data = await api<{ medicine: Medicine }>(`/medicines/${medicine.id}`);
    setSelectedMedicine(data.medicine);

    if (reveal) {
      setActiveView('details');
      window.setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    }

    return data.medicine;
  };

  useEffect(() => {
    loadMedicines()
      .then((items) => {
        if (items[0]) viewMedicine(items[0]).catch(() => undefined);
      })
      .catch((error) => toast.error(error.message));
  }, []);

  const visibleMedicines = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return medicines;

    return medicines.filter((medicine) => [
      medicine.name,
      medicine.medicine_no,
      medicine.generic_name,
      medicine.category,
      medicine.dosage_form,
      medicine.supplier,
      medicine.status,
    ].some((value) => value?.toLowerCase().includes(query)));
  }, [medicines, search]);

  const inventoryStats = useMemo(() => {
    const lowStock = medicines.filter((medicine) => medicine.status === 'low_stock').length;
    const expired = medicines.filter((medicine) => medicine.status === 'expired').length;
    const totalUnits = medicines.reduce((total, medicine) => total + Number(medicine.stock_qty || 0), 0);
    const totalValue = medicines.reduce((total, medicine) => total + (Number(medicine.stock_qty || 0) * Number(medicine.unit_price || 0)), 0);

    return { lowStock, expired, totalUnits, totalValue };
  }, [medicines]);

  const startCreate = () => {
    setEditingMedicine(null);
    setForm(emptyForm);
    setActiveView('form');
  };

  const startEdit = async (medicine: Medicine) => {
    try {
      const detail = await viewMedicine(medicine);
      setEditingMedicine(detail);
      setForm({
        name: detail.name ?? '',
        generic_name: detail.generic_name ?? '',
        category: detail.category ?? '',
        dosage_form: detail.dosage_form ?? '',
        stock_qty: String(detail.stock_qty ?? 0),
        low_stock_threshold: String(detail.low_stock_threshold ?? 10),
        unit_price: String(detail.unit_price ?? 0),
        expiry_date: detail.expiry_date ?? '',
        supplier: detail.supplier ?? '',
      });
      setActiveView('form');
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const closeForm = () => {
    setEditingMedicine(null);
    setForm(emptyForm);
    setActiveView('inventory');
  };

  const handleView = async (medicine: Medicine) => {
    try {
      await viewMedicine(medicine, true);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        stock_qty: Number(form.stock_qty || 0),
        low_stock_threshold: Number(form.low_stock_threshold || 0),
        unit_price: Number(form.unit_price || 0),
        expiry_date: form.expiry_date || null,
      };

      const result = editingMedicine
        ? await api<{ medicine: Medicine }>(`/medicines/${editingMedicine.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        : await api<{ medicine: Medicine }>('/medicines', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

      toast.success(editingMedicine ? 'Medicine updated' : 'Medicine added');
      setEditingMedicine(null);
      setForm(emptyForm);
      setActiveView('inventory');
      await loadMedicines();
      await viewMedicine(result.medicine);
      onChanged();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const deleteMedicine = async (medicine: Medicine) => {
    const confirmed = await confirmDelete(
      `Delete ${medicine.name}?`,
      'This removes it from the active inventory list.'
    );
    if (!confirmed) return;

    try {
      await api(`/medicines/${medicine.id}`, { method: 'DELETE' });
      showSuccess('Medicine deleted');
      const items = await loadMedicines();
      if (selectedMedicine?.id === medicine.id) {
        if (items[0]) await viewMedicine(items[0]);
        else setSelectedMedicine(null);
      }
      onChanged();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  if (activeView === 'form') {
    return (
      <div className="mt-6">
        <MedicineTabBar activeView={activeView} editingMedicine={editingMedicine} onInventory={closeForm} onForm={startCreate} />
        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <MedicineEditor medicine={editingMedicine} form={form} loading={loading} onCancel={closeForm} onSubmit={submit} setForm={setForm} />
          <MedicineFormGuide medicine={editingMedicine} />
        </div>
      </div>
    );
  }

  if (activeView === 'details') {
    return (
      <div className="mt-6">
        <MedicineTabBar activeView={activeView} editingMedicine={editingMedicine} onInventory={closeForm} onForm={startCreate} />
        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <MedicineDetails medicine={selectedMedicine} detailsRef={detailsRef} onEdit={startEdit} />
          <MedicineDetailsGuide onInventory={closeForm} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <MedicineTabBar activeView={activeView} editingMedicine={editingMedicine} onInventory={closeForm} onForm={startCreate} />
      <div className="mt-4 grid gap-5 2xl:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
        <section className="min-w-0 overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
          <div className="border-b border-[#eceef5] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-sm font-bold text-[#696cff]">Medicine inventory</p>
                <h1 className="mt-1 text-2xl font-bold text-[#566a7f]">Medicines</h1>
                <p className="mt-1 text-sm text-[#a1acb8]">Add stock, edit medicine details, view status, or remove inactive inventory items.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="flex min-h-12 min-w-0 items-center gap-2 rounded-xl bg-[#f5f5f9] px-3 text-[#697a8d] sm:w-[290px]">
                  <Search className="h-4 w-4 shrink-0" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search medicines" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
                </label>
                <button type="button" onClick={startCreate} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#566a7f] px-4 text-sm font-bold text-white">
                  <Plus className="h-4 w-4" />
                  Add medicine
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <InventoryStat label="Items" value={medicines.length.toString()} tone="indigo" />
              <InventoryStat label="Units" value={inventoryStats.totalUnits.toLocaleString('en-US')} tone="blue" />
              <InventoryStat label="Low stock" value={inventoryStats.lowStock.toString()} tone="amber" />
              <InventoryStat label="Value" value={formatMoney(inventoryStats.totalValue)} tone="green" />
            </div>
          </div>

          <div className="grid gap-3 p-4 lg:hidden">
            {visibleMedicines.map((medicine) => (
              <MedicineCard key={medicine.id} medicine={medicine} onDelete={deleteMedicine} onEdit={startEdit} onView={handleView} selected={selectedMedicine?.id === medicine.id} />
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#f5f5f9] text-xs font-bold uppercase text-[#a1acb8]">
                <tr>
                  <th className="px-5 py-4">Medicine</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleMedicines.map((medicine) => (
                  <tr key={medicine.id} className={`border-t border-[#eceef5] ${selectedMedicine?.id === medicine.id ? 'bg-[#fbfbff]' : ''}`}>
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => handleView(medicine)} className="text-left">
                        <span className="block font-bold text-[#566a7f]">{medicine.name}</span>
                        <span className="block text-xs font-bold text-[#696cff]">{medicine.medicine_no}</span>
                      </button>
                    </td>
                    <td className="pr-4">
                      <span className="block font-semibold text-[#566a7f]">{medicine.category ?? 'General'}</span>
                      <span className="block text-xs text-[#a1acb8]">{medicine.dosage_form ?? 'Form not set'}</span>
                    </td>
                    <td className="pr-4">
                      <span className="block font-bold text-[#566a7f]">{medicine.stock_qty}</span>
                      <span className="block text-xs text-[#a1acb8]">Alert at {medicine.low_stock_threshold}</span>
                    </td>
                    <td className="pr-4 font-semibold text-[#566a7f]">{formatMoney(medicine.unit_price)}</td>
                    <td className="pr-4">{medicine.expiry_date ?? 'Not set'}</td>
                    <td className="pr-4"><MedicineStatus status={medicine.status} /></td>
                    <td className="pr-5">
                      <div className="flex gap-2">
                        <IconButton title="View medicine" icon={<Eye className="h-4 w-4" />} onClick={() => handleView(medicine)} />
                        <IconButton title="Edit medicine" icon={<PencilLine className="h-4 w-4" />} onClick={() => startEdit(medicine)} />
                        <IconButton title="Delete medicine" danger icon={<Trash2 className="h-4 w-4" />} onClick={() => deleteMedicine(medicine)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visibleMedicines.length === 0 && <p className="px-5 py-10 text-center text-[#a1acb8]">No medicines found.</p>}
        </section>

        <MedicineDetails medicine={selectedMedicine} detailsRef={detailsRef} onEdit={startEdit} />
      </div>
    </div>
  );
}

function MedicineTabBar({ activeView, editingMedicine, onInventory, onForm }: {
  activeView: 'inventory' | 'form' | 'details';
  editingMedicine: Medicine | null;
  onInventory: () => void;
  onForm: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-2 shadow-[0_2px_6px_rgba(67,89,113,0.12)] sm:flex-row sm:items-center sm:justify-between">
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={onInventory} className={`min-h-11 rounded-xl px-4 text-sm font-bold ${activeView === 'inventory' ? 'bg-[#696cff] text-white' : 'bg-[#f5f5f9] text-[#697a8d]'}`}>
          Medicine inventory
        </button>
        <button type="button" onClick={onForm} className={`min-h-11 rounded-xl px-4 text-sm font-bold ${activeView === 'form' ? 'bg-[#696cff] text-white' : 'bg-[#f5f5f9] text-[#697a8d]'}`}>
          {editingMedicine ? 'Edit medicine form' : 'Add medicine form'}
        </button>
      </div>
      <p className="px-2 text-sm text-[#a1acb8]">
        {activeView === 'form' && 'Save inventory details and stock thresholds.'}
        {activeView === 'details' && 'Medicine detail view is open.'}
        {activeView === 'inventory' && 'Choose Add medicine to create a new inventory item.'}
      </p>
    </div>
  );
}

function MedicineEditor({ medicine, form, loading, onCancel, onSubmit, setForm }: {
  medicine: Medicine | null;
  form: MedicineForm;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (event: FormEvent) => void;
  setForm: React.Dispatch<React.SetStateAction<MedicineForm>>;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#696cff]">{medicine ? 'Update medicine' : 'New medicine'}</p>
          <h2 className="mt-1 text-xl font-bold text-[#566a7f]">{medicine ? medicine.medicine_no : 'Create inventory item'}</h2>
          <p className="mt-1 text-sm leading-6 text-[#a1acb8]">Stock status updates automatically from expiry date and threshold.</p>
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#eef0ff] text-[#696cff]">
          <Pill className="h-6 w-6" />
        </span>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
        <MedicineField label="Medicine name" value={form.name} required onChange={(name) => setForm((current) => ({ ...current, name }))} />
        <MedicineField label="Generic name" value={form.generic_name} onChange={(generic_name) => setForm((current) => ({ ...current, generic_name }))} />
        <MedicineField label="Category" value={form.category} onChange={(category) => setForm((current) => ({ ...current, category }))} />
        <MedicineField label="Dosage form" value={form.dosage_form} onChange={(dosage_form) => setForm((current) => ({ ...current, dosage_form }))} />
        <MedicineField label="Stock quantity" value={form.stock_qty} type="number" onChange={(stock_qty) => setForm((current) => ({ ...current, stock_qty }))} />
        <MedicineField label="Low stock alert" value={form.low_stock_threshold} type="number" onChange={(low_stock_threshold) => setForm((current) => ({ ...current, low_stock_threshold }))} />
        <MedicineField label="Unit price" value={form.unit_price} type="number" step="0.01" onChange={(unit_price) => setForm((current) => ({ ...current, unit_price }))} />
        <MedicineField label="Expiry date" value={form.expiry_date} type="date" onChange={(expiry_date) => setForm((current) => ({ ...current, expiry_date }))} />
        <MedicineField label="Supplier" value={form.supplier} onChange={(supplier) => setForm((current) => ({ ...current, supplier }))} wide />
        <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
          <button disabled={loading} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#696cff] px-4 font-bold text-white disabled:opacity-60">
            <Plus className="h-4 w-4" />
            {loading ? 'Saving...' : medicine ? 'Update medicine' : 'Add medicine'}
          </button>
          <button type="button" onClick={onCancel} className="min-h-12 rounded-xl border border-[#d9dee3] px-4 font-bold text-[#697a8d]">
            {medicine ? 'Cancel edit' : 'Close form'}
          </button>
        </div>
      </form>
    </section>
  );
}

function MedicineFormGuide({ medicine }: { medicine: Medicine | null }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
      <p className="text-sm font-bold text-[#696cff]">{medicine ? 'Editing stock' : 'Inventory checklist'}</p>
      <h2 className="mt-1 text-xl font-bold text-[#566a7f]">{medicine?.name ?? 'Medicine form workspace'}</h2>
      <div className="mt-5 grid gap-2">
        <FormFact icon={<Package className="h-4 w-4" />} text="Stock quantity is compared with the alert threshold." />
        <FormFact icon={<CalendarClock className="h-4 w-4" />} text="Past expiry dates mark the medicine as expired." />
        <FormFact icon={<Truck className="h-4 w-4" />} text="Supplier and category help admin search later." />
      </div>
    </section>
  );
}

function MedicineDetailsGuide({ onInventory }: { onInventory: () => void }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
      <p className="text-sm font-bold text-[#696cff]">Medicine view</p>
      <h2 className="mt-1 text-xl font-bold text-[#566a7f]">Inventory item detail</h2>
      <p className="mt-2 text-sm leading-6 text-[#697a8d]">Use Edit to update the item, or return to the inventory list for all actions.</p>
      <button type="button" onClick={onInventory} className="mt-5 min-h-11 rounded-xl bg-[#566a7f] px-4 text-sm font-bold text-white">
        Back to inventory
      </button>
    </section>
  );
}

function MedicineDetails({ medicine, detailsRef, onEdit }: { medicine: Medicine | null; detailsRef: React.RefObject<HTMLElement | null>; onEdit: (medicine: Medicine) => void }) {
  if (!medicine) {
    return <section ref={detailsRef} className="scroll-mt-4 rounded-2xl bg-white p-6 text-center text-[#a1acb8] shadow-[0_2px_6px_rgba(67,89,113,0.12)]">Select a medicine to view details.</section>;
  }

  return (
    <section ref={detailsRef} className="scroll-mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
      <div className="border-b border-[#eceef5] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#eef0ff] text-[#696cff]">
              <Pill className="h-7 w-7" />
            </span>
            <span className="min-w-0">
              <p className="text-sm font-bold text-[#696cff]">Medicine detail</p>
              <h2 className="mt-1 truncate text-xl font-bold text-[#566a7f]">{medicine.name}</h2>
              <p className="text-sm text-[#a1acb8]">{medicine.medicine_no}</p>
            </span>
          </div>
          <IconButton title="Edit medicine" icon={<PencilLine className="h-4 w-4" />} onClick={() => onEdit(medicine)} />
        </div>
      </div>
      <div className="grid gap-3 p-5 text-sm sm:grid-cols-2">
        <MedicineFact icon={<Pill className="h-4 w-4" />} label="Generic name" value={medicine.generic_name ?? 'Not set'} />
        <MedicineFact icon={<Package className="h-4 w-4" />} label="Category" value={medicine.category ?? 'General'} />
        <MedicineFact icon={<BadgeCheck className="h-4 w-4" />} label="Dosage form" value={medicine.dosage_form ?? 'Not set'} />
        <MedicineFact icon={<Package className="h-4 w-4" />} label="Stock" value={`${medicine.stock_qty} units, alert at ${medicine.low_stock_threshold}`} />
        <MedicineFact icon={<CircleDollarSign className="h-4 w-4" />} label="Unit price" value={formatMoney(medicine.unit_price)} />
        <MedicineFact icon={<CalendarClock className="h-4 w-4" />} label="Expiry date" value={medicine.expiry_date ?? 'Not set'} />
        <MedicineFact icon={<Truck className="h-4 w-4" />} label="Supplier" value={medicine.supplier ?? 'Not set'} />
        <MedicineFact icon={<AlertTriangle className="h-4 w-4" />} label="Status" value={labelStatus(medicine.status)} />
      </div>
    </section>
  );
}

function MedicineCard({ medicine, onDelete, onEdit, onView, selected }: {
  medicine: Medicine;
  onDelete: (medicine: Medicine) => void;
  onEdit: (medicine: Medicine) => void;
  onView: (medicine: Medicine) => void;
  selected: boolean;
}) {
  return (
    <article className={`rounded-xl border p-4 ${selected ? 'border-[#696cff] bg-[#fbfbff]' : 'border-[#eceef5] bg-[#fcfdff]'}`}>
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => onView(medicine)} className="min-w-0 text-left">
          <span className="block truncate font-bold text-[#566a7f]">{medicine.name}</span>
          <span className="block text-xs font-bold text-[#696cff]">{medicine.medicine_no}</span>
        </button>
        <MedicineStatus status={medicine.status} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <span className="rounded-xl bg-white px-3 py-2">
          <span className="block text-[11px] font-bold uppercase text-[#a1acb8]">Stock</span>
          <span className="font-bold text-[#566a7f]">{medicine.stock_qty}</span>
        </span>
        <span className="rounded-xl bg-white px-3 py-2">
          <span className="block text-[11px] font-bold uppercase text-[#a1acb8]">Price</span>
          <span className="font-bold text-[#566a7f]">{formatMoney(medicine.unit_price)}</span>
        </span>
      </div>
      <div className="mt-3 flex gap-2">
        <IconButton title="View medicine" icon={<Eye className="h-4 w-4" />} onClick={() => onView(medicine)} />
        <IconButton title="Edit medicine" icon={<PencilLine className="h-4 w-4" />} onClick={() => onEdit(medicine)} />
        <IconButton title="Delete medicine" danger icon={<Trash2 className="h-4 w-4" />} onClick={() => onDelete(medicine)} />
      </div>
    </article>
  );
}

function MedicineField({ label, value, onChange, type = 'text', step, required = false, wide = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  step?: string;
  required?: boolean;
  wide?: boolean;
}) {
  return (
    <label className={wide ? 'sm:col-span-2' : ''}>
      <span className="mb-1 block text-sm font-bold text-[#566a7f]">{label}</span>
      <input required={required} type={type} min={type === 'number' ? 0 : undefined} step={step} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full rounded-xl border border-[#d9dee3] bg-[#fcfdff] px-3 outline-none focus:border-[#696cff]" />
    </label>
  );
}

function InventoryStat({ label, value, tone }: { label: string; value: string; tone: 'indigo' | 'blue' | 'amber' | 'green' }) {
  const palette = {
    indigo: 'bg-[#eef0ff] text-[#696cff]',
    blue: 'bg-[#e7f8ff] text-[#03a6cf]',
    amber: 'bg-[#fff2d6] text-[#ffab00]',
    green: 'bg-[#e8fadf] text-[#5bbf22]',
  }[tone];

  return (
    <div className="rounded-xl bg-[#fcfdff] p-3">
      <p className="text-[11px] font-bold uppercase text-[#a1acb8]">{label}</p>
      <p className={`mt-1 inline-flex min-h-8 items-center rounded-lg px-2 text-lg font-bold ${palette}`}>{value}</p>
    </div>
  );
}

function MedicineStatus({ status }: { status: string }) {
  const palette = {
    active: 'bg-[#e8fadf] text-[#5bbf22]',
    low_stock: 'bg-[#fff2d6] text-[#ffab00]',
    expired: 'bg-[#fff0ed] text-[#ff3e1d]',
    inactive: 'bg-[#f5f5f9] text-[#697a8d]',
  }[status] ?? 'bg-[#f5f5f9] text-[#697a8d]';

  return <span className={`rounded-lg px-2 py-1 text-xs font-bold ${palette}`}>{labelStatus(status)}</span>;
}

function MedicineFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <span className="flex gap-2 rounded-xl bg-[#f8f8fb] p-3">
      <span className="mt-0.5 text-[#696cff]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[11px] font-bold uppercase text-[#a1acb8]">{label}</span>
        <span className="block break-words font-semibold text-[#566a7f]">{value}</span>
      </span>
    </span>
  );
}

function FormFact({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex gap-2 rounded-xl bg-[#f8f8fb] p-3 text-sm font-semibold text-[#566a7f]">
      <span className="mt-0.5 text-[#696cff]">{icon}</span>
      <span>{text}</span>
    </span>
  );
}

function IconButton({ icon, title, onClick, danger = false }: { icon: React.ReactNode; title: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={title} className={`grid h-9 w-9 place-items-center rounded-lg ${danger ? 'bg-[#fff0ed] text-[#ff3e1d]' : 'bg-[#eef0ff] text-[#696cff]'}`}>
      {icon}
    </button>
  );
}

function labelStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMoney(value: string | number) {
  return `LKR ${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
