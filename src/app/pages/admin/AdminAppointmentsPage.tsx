import { useEffect, useState } from 'react';
import {
  Calendar,
  ClipboardList,
  Clock,
  Filter,
  Info,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  User,
  Users,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, Appointment, Doctor, Patient } from '../../lib/api';

const statusOptions = ['pending', 'confirmed', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show'];

export function AdminAppointmentsPage({
  appointments,
  onChanged,
}: {
  appointments: Appointment[];
  onChanged: () => void;
}) {
  // Navigation & Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Interactive UI States
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Doctors & Patients lists for the Booking Form
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  
  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    doctor_id: '',
    patient_id: '',
    patient_name: '',
    patient_phone: '',
    patient_email: '',
    appointment_date: new Date().toISOString().slice(0, 10),
    time_slot: '',
    reason: '',
  });

  // Modal Notes State
  const [editingNotes, setEditingNotes] = useState('');
  const [modalStatus, setModalStatus] = useState('');

  // Fetch doctors and patients on mount/load
  useEffect(() => {
    api<{ doctors: Doctor[] }>('/doctors')
      .then((data) => setDoctors(data.doctors))
      .catch(() => undefined);
    
    api<{ patients: Patient[] }>('/patients')
      .then((data) => setPatients(data.patients))
      .catch(() => undefined);
  }, []);

  // Fetch slots when doctor or date changes in booking form
  useEffect(() => {
    if (!bookingForm.doctor_id || !bookingForm.appointment_date) return;
    api<{ slots: { time: string; available: boolean }[] }>(
      `/doctors/${bookingForm.doctor_id}/slots?date=${bookingForm.appointment_date}`
    )
      .then((data) => setSlots(data.slots))
      .catch((error) => toast.error(error.message));
  }, [bookingForm.doctor_id, bookingForm.appointment_date]);

  // Set notes & status when modal opens
  useEffect(() => {
    if (selectedAppointment) {
      setEditingNotes(selectedAppointment.doctor_notes ?? '');
      setModalStatus(selectedAppointment.status);
    }
  }, [selectedAppointment]);

  const handleUpdateStatus = async (appointment: Appointment, status: string, notes?: string) => {
    try {
      const payload: Record<string, unknown> = { status };
      if (notes !== undefined) {
        payload.doctor_notes = notes;
      }
      
      const res = await api<{ appointment: Appointment }>(`/appointments/${appointment.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      
      toast.success('Appointment status updated');
      onChanged();
      
      // Update selected modal appointment reference if open
      if (selectedAppointment && selectedAppointment.id === appointment.id) {
        setSelectedAppointment(res.appointment);
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleBookAppointment = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: Record<string, unknown> = {
      doctor_id: Number(bookingForm.doctor_id),
      appointment_date: bookingForm.appointment_date,
      time_slot: bookingForm.time_slot,
      reason: bookingForm.reason,
    };

    if (bookingForm.patient_id) {
      payload.patient_id = Number(bookingForm.patient_id);
    } else {
      payload.patient = {
        full_name: bookingForm.patient_name,
        phone: bookingForm.patient_phone,
        email: bookingForm.patient_email || undefined,
      };
    }

    try {
      const result = await api<{ appointment: Appointment }>('/appointments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      toast.success(`Successfully booked appointment ${result.appointment.appointment_no}`);
      
      // Reset Booking form
      setBookingForm({
        doctor_id: '',
        patient_id: '',
        patient_name: '',
        patient_phone: '',
        patient_email: '',
        appointment_date: new Date().toISOString().slice(0, 10),
        time_slot: '',
        reason: '',
      });
      setShowBookingForm(false);
      onChanged();
      
      // Reload patients list to include newly created walk-in patient if applicable
      api<{ patients: Patient[] }>('/patients')
        .then((data) => setPatients(data.patients))
        .catch(() => undefined);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // Client-side filtering logic
  const filteredAppointments = appointments.filter((appointment) => {
    const searchLower = searchTerm.toLowerCase();
    
    // Check search inputs
    const matchesSearch = 
      appointment.appointment_no.toLowerCase().includes(searchLower) ||
      appointment.patient.full_name.toLowerCase().includes(searchLower) ||
      appointment.doctor.full_name.toLowerCase().includes(searchLower) ||
      (appointment.reason && appointment.reason.toLowerCase().includes(searchLower)) ||
      appointment.doctor.specialization.toLowerCase().includes(searchLower);

    const matchesStatus = !statusFilter || appointment.status === statusFilter;
    const matchesDoctor = !doctorFilter || appointment.doctor.id === Number(doctorFilter);
    const matchesDate = !dateFilter || appointment.appointment_date === dateFilter;

    return matchesSearch && matchesStatus && matchesDoctor && matchesDate;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDoctorFilter('');
    setDateFilter('');
  };

  const isFilterActive = searchTerm || statusFilter || doctorFilter || dateFilter;

  // Stat variables for metrics strip
  const totalCount = appointments.length;
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const activeCount = appointments.filter((a) => ['confirmed', 'arrived', 'in_progress'].includes(a.status)).length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;

  // Get status color styling helper
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#fff2d6] text-[#ffab00]';
      case 'confirmed':
        return 'bg-[#eef0ff] text-[#696cff]';
      case 'arrived':
        return 'bg-[#e1f5fe] text-[#0288d1]';
      case 'in_progress':
        return 'bg-[#e0f2f1] text-[#00695c]';
      case 'completed':
        return 'bg-[#e8fadf] text-[#71dd37]';
      case 'cancelled':
      case 'no_show':
        return 'bg-[#fff0ed] text-[#ff3e1d]';
      default:
        return 'bg-[#f5f5f9] text-[#a1acb8]';
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-4 sm:mt-6 sm:gap-5">
      {/* 1. Metrics strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef0ff] text-[#696cff]">
              <ClipboardList className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-[#a1acb8]">Total Bookings</p>
              <h3 className="text-xl font-extrabold text-[#566a7f]">{totalCount}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff2d6] text-[#ffab00]">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-[#a1acb8]">Pending Approval</p>
              <h3 className="text-xl font-extrabold text-[#566a7f]">{pendingCount}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e0f2f1] text-[#00695c]">
              <Stethoscope className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-[#a1acb8]">Active Slots</p>
              <h3 className="text-xl font-extrabold text-[#566a7f]">{activeCount}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8fadf] text-[#71dd37]">
              <CheckCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-[#a1acb8]">Resolved Visits</p>
              <h3 className="text-xl font-extrabold text-[#566a7f]">{completedCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Filters Panel */}
      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_6px_rgba(67,89,113,0.12)] sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-[#566a7f]">Administrative Controls</h2>
              <p className="text-xs text-[#a1acb8]">Search records, adjust queue criteria, and schedule bookings</p>
            </div>
            <button
              onClick={() => setShowBookingForm((prev) => !prev)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#696cff] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-100 hover:brightness-105"
            >
              {showBookingForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showBookingForm ? 'Close Form' : 'New Appointment'}
            </button>
          </div>

          {/* 3. Booking Form Sheet */}
          {showBookingForm && (
            <div className="rounded-2xl border border-[#eceef5] bg-[#fdfdfe] p-4 shadow-inner">
              <div className="mb-4 flex items-center gap-2 border-b border-[#eceef5] pb-2">
                <span className="text-[#696cff]">
                  <BookOpen className="h-5 w-5" />
                </span>
                <h3 className="text-sm font-bold text-[#566a7f]">Schedule Staff / Walk-in Session</h3>
              </div>

              <form onSubmit={handleBookAppointment} className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="flex flex-col gap-1 sm:col-span-2 md:col-span-3">
                  <label className="text-xs font-bold uppercase text-[#a1acb8]">Patient Selection</label>
                  <select
                    value={bookingForm.patient_id}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        patient_id: event.target.value,
                        patient_name: '',
                        patient_phone: '',
                        patient_email: '',
                      })
                    }
                    className="h-11 rounded-xl border border-[#d9dee3] bg-white px-3 text-sm font-semibold outline-none focus:border-[#696cff]"
                  >
                    <option value="">+ Register Quick Walk-in Patient</option>
                    {patients.map((pat) => (
                      <option key={pat.id} value={pat.id}>
                        {pat.patient_no} - {pat.full_name} ({pat.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {!bookingForm.patient_id && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold uppercase text-[#a1acb8]">Patient Name</label>
                      <input
                        required
                        type="text"
                        placeholder="John Doe"
                        value={bookingForm.patient_name}
                        onChange={(e) => setBookingForm({ ...bookingForm, patient_name: e.target.value })}
                        className="h-11 rounded-xl border border-[#d9dee3] px-3 text-sm font-semibold outline-none focus:border-[#696cff]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold uppercase text-[#a1acb8]">Patient Phone</label>
                      <input
                        required
                        type="tel"
                        placeholder="0771234567"
                        value={bookingForm.patient_phone}
                        onChange={(e) => setBookingForm({ ...bookingForm, patient_phone: e.target.value })}
                        className="h-11 rounded-xl border border-[#d9dee3] px-3 text-sm font-semibold outline-none focus:border-[#696cff]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold uppercase text-[#a1acb8]">Patient Email (Optional)</label>
                      <input
                        type="email"
                        placeholder="patient@example.com"
                        value={bookingForm.patient_email}
                        onChange={(e) => setBookingForm({ ...bookingForm, patient_email: e.target.value })}
                        className="h-11 rounded-xl border border-[#d9dee3] px-3 text-sm font-semibold outline-none focus:border-[#696cff]"
                      />
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase text-[#a1acb8]">Consulting Doctor</label>
                  <select
                    required
                    value={bookingForm.doctor_id}
                    onChange={(e) => setBookingForm({ ...bookingForm, doctor_id: e.target.value, time_slot: '' })}
                    className="h-11 rounded-xl border border-[#d9dee3] bg-white px-3 text-sm font-semibold outline-none focus:border-[#696cff]"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.full_name} ({doc.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase text-[#a1acb8]">Target Date</label>
                  <input
                    required
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={bookingForm.appointment_date}
                    onChange={(e) => setBookingForm({ ...bookingForm, appointment_date: e.target.value, time_slot: '' })}
                    className="h-11 rounded-xl border border-[#d9dee3] px-3 text-sm font-semibold outline-none focus:border-[#696cff]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase text-[#a1acb8]">Available Time Slots</label>
                  <select
                    required
                    disabled={!bookingForm.doctor_id}
                    value={bookingForm.time_slot}
                    onChange={(e) => setBookingForm({ ...bookingForm, time_slot: e.target.value })}
                    className="h-11 rounded-xl border border-[#d9dee3] bg-white px-3 text-sm font-semibold outline-none focus:border-[#696cff] disabled:opacity-50"
                  >
                    <option value="">Select Time</option>
                    {slots.map((s) => (
                      <option key={s.time} value={s.time} disabled={!s.available}>
                        {s.time} {!s.available ? '(Booked)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2 md:col-span-3">
                  <label className="text-xs font-bold uppercase text-[#a1acb8]">Chief Complaint / Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Enter symptoms or visit reasons..."
                    value={bookingForm.reason}
                    onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                    className="rounded-xl border border-[#d9dee3] px-3 py-2 text-sm font-semibold outline-none focus:border-[#696cff]"
                  />
                </div>

                <div className="flex justify-end gap-2 sm:col-span-2 md:col-span-3">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="rounded-xl border border-[#eceef5] px-4 py-2.5 text-sm font-bold text-[#697a8d] hover:bg-[#f5f5f9]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#696cff] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:brightness-105"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 4. Filters strip */}
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {/* Search Input */}
            <div className="relative flex items-center">
              <span className="absolute left-3 text-[#a1acb8]">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search patient, doc, complaint..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#d9dee3] pl-9 pr-3 text-sm font-semibold outline-none focus:border-[#696cff]"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl border border-[#d9dee3] bg-white px-3 text-sm font-semibold outline-none focus:border-[#696cff]"
            >
              <option value="">Filter Status (All)</option>
              {statusOptions.map((st) => (
                <option key={st} value={st}>
                  {st.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>

            {/* Doctor filter */}
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="h-11 rounded-xl border border-[#d9dee3] bg-white px-3 text-sm font-semibold outline-none focus:border-[#696cff]"
            >
              <option value="">Filter Doctor (All)</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.full_name}
                </option>
              ))}
            </select>

            {/* Date filter */}
            <div className="relative flex items-center">
              <span className="absolute left-3 text-[#a1acb8]">
                <Calendar className="h-4 w-4" />
              </span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#d9dee3] pl-9 pr-3 text-sm font-semibold outline-none focus:border-[#696cff]"
              />
            </div>
          </div>

          {/* Active Filter Clear indicator */}
          {isFilterActive && (
            <div className="flex items-center justify-between border-t border-[#eceef5] pt-3">
              <span className="text-xs font-semibold text-[#a1acb8]">
                Showing {filteredAppointments.length} of {totalCount} total results
              </span>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-bold text-[#ff3e1d] hover:underline"
              >
                <X className="h-3 w-3" />
                Clear Active Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Main Appointments Table Container */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(67,89,113,0.12)]">
        {/* Mobile View Card Grid */}
        <div className="grid gap-3 p-4 md:hidden">
          {filteredAppointments.map((app) => (
            <div key={app.id} className="rounded-xl border border-[#eceef5] bg-[#fcfdff] p-4">
              <div className="flex items-start justify-between gap-3 border-b border-[#eceef5]/60 pb-2">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-[#696cff]">
                    {app.appointment_no}
                  </span>
                  <span className="block text-[11px] font-semibold text-[#a1acb8]">
                    {app.appointment_date} at {app.time_slot}
                  </span>
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(app.status)}`}>
                  {app.status}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-xs">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-[#a1acb8]">Patient</span>
                  <span className="font-semibold text-[#566a7f]">
                    {app.patient.full_name} ({app.patient.patient_no})
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-[#a1acb8]">Specialist</span>
                  <span className="font-medium text-[#697a8d]">
                    {app.doctor.full_name} - <span className="text-[#696cff]">{app.doctor.specialization}</span>
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#eceef5]/60 pt-3">
                <select
                  value={app.status}
                  onChange={(e) => handleUpdateStatus(app, e.target.value)}
                  className="rounded-lg border border-[#d9dee3] bg-white px-2 py-1 text-xs font-semibold text-[#566a7f]"
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setSelectedAppointment(app)}
                  className="flex items-center gap-1 rounded-lg bg-[#eef0ff] px-3 py-1.5 text-xs font-bold text-[#696cff]"
                >
                  <Info className="h-3.5 w-3.5" />
                  Details
                </button>
              </div>
            </div>
          ))}
          {filteredAppointments.length === 0 && (
            <div className="py-8 text-center text-sm font-medium text-[#a1acb8]">
              No clinic appointments matched filters.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="bg-[#f5f5f9] text-xs font-bold uppercase text-[#a1acb8] border-b border-[#eceef5]">
              <tr>
                <th className="w-[18%] px-5 py-4">Appointment</th>
                <th className="w-[22%]">Patient Info</th>
                <th className="w-[22%]">Assigned Doctor</th>
                <th className="w-[16%]">Schedule Date</th>
                <th className="w-[12%]">Status</th>
                <th className="w-[10%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((app) => (
                <tr key={app.id} className="border-b border-[#eceef5] hover:bg-[#fbfbfe]">
                  <td className="px-5 py-3.5">
                    <span className="block font-bold text-[#696cff]">
                      {app.appointment_no}
                    </span>
                    <span className="text-[11px] font-bold text-[#a1acb8]">
                      Slots: {app.time_slot}
                    </span>
                  </td>
                  <td>
                    <span className="block font-bold text-[#566a7f]">
                      {app.patient.full_name}
                    </span>
                    <span className="block text-[11px] text-[#a1acb8]">
                      No: {app.patient.patient_no} | Tel: {app.patient.phone}
                    </span>
                  </td>
                  <td>
                    <span className="block font-semibold text-[#697a8d]">
                      {app.doctor.full_name}
                    </span>
                    <span className="block text-[11px] font-semibold text-[#696cff]">
                      {app.doctor.specialization}
                    </span>
                  </td>
                  <td className="font-semibold text-[#566a7f]">
                    {app.appointment_date}
                  </td>
                  <td>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${getStatusStyle(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateStatus(app, e.target.value)}
                        className="rounded-lg border border-[#d9dee3] bg-white px-2 py-1.5 text-xs font-semibold text-[#566a7f] shadow-sm focus:border-[#696cff]"
                      >
                        {statusOptions.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => setSelectedAppointment(app)}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-[#eef0ff] text-[#696cff] hover:brightness-95"
                        title="View consultation details"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAppointments.length === 0 && (
            <div className="py-12 text-center text-sm font-semibold text-[#a1acb8]">
              No clinic appointments matched filters.
            </div>
          )}
        </div>
      </div>

      {/* 6. High-Fidelity Details View Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-[24px] bg-white shadow-2xl shadow-slate-950/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#eceef5] bg-[#696cff] px-6 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white">
                  <ClipboardList className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-extrabold">{selectedAppointment.appointment_no}</h3>
                  <p className="text-[11px] text-white/80">Detailed Clinical Session Review</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5">
              {/* Progress Timeline strip */}
              <div className="flex items-center justify-between rounded-xl bg-[#f5f5f9] p-3 text-xs font-bold text-[#566a7f]">
                <span>Status Workflow:</span>
                <span className={`rounded-lg px-2.5 py-0.5 ${getStatusStyle(selectedAppointment.status)} font-extrabold uppercase`}>
                  {selectedAppointment.status}
                </span>
              </div>

              {/* Patient Card details */}
              <div className="rounded-2xl border border-[#eceef5] p-4 bg-[#fcfdff]">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#a1acb8] border-b border-[#eceef5] pb-1.5 mb-2">
                  <User className="h-4 w-4 text-[#696cff]" />
                  Patient Profile
                </h4>
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <span className="block text-[11px] text-[#a1acb8]">Full Name</span>
                    <strong className="text-[#566a7f]">{selectedAppointment.patient.full_name}</strong>
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#a1acb8]">Patient Registration ID</span>
                    <strong className="text-[#696cff]">{selectedAppointment.patient.patient_no}</strong>
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#a1acb8]">Phone Number</span>
                    <span className="font-semibold text-[#566a7f]">{selectedAppointment.patient.phone}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#a1acb8]">Email Address</span>
                    <span className="font-medium text-[#697a8d]">{selectedAppointment.patient.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="rounded-2xl border border-[#eceef5] p-4 bg-[#fcfdff]">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#a1acb8] border-b border-[#eceef5] pb-1.5 mb-2">
                  <Stethoscope className="h-4 w-4 text-[#71dd37]" />
                  Consulting Practitioner
                </h4>
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <span className="block text-[11px] text-[#a1acb8]">Specialist</span>
                    <strong className="text-[#566a7f]">{selectedAppointment.doctor.full_name}</strong>
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#a1acb8]">Field of Practice</span>
                    <span className="font-bold text-[#696cff]">{selectedAppointment.doctor.specialization}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#a1acb8]">Booking Date & Slot</span>
                    <span className="font-bold text-[#566a7f]">
                      {selectedAppointment.appointment_date} at {selectedAppointment.time_slot}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#a1acb8]">Practice Qualifications</span>
                    <span className="font-medium text-[#697a8d]">
                      {selectedAppointment.doctor.qualification || 'MBBS / General'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chief Complaint Reason */}
              {selectedAppointment.reason && (
                <div className="rounded-2xl border border-[#eceef5] p-4 bg-[#fffbf2]">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#ffab00] border-b border-[#ffab00]/20 pb-1.5 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    Chief Complaint / Symptoms
                  </h4>
                  <p className="text-sm font-semibold leading-relaxed text-[#566a7f]">
                    {selectedAppointment.reason}
                  </p>
                </div>
              )}

              {/* Doctor Clinical Notes */}
              <div className="rounded-2xl border border-[#eceef5] p-4 bg-white space-y-3">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#566a7f] border-b border-[#eceef5] pb-1.5">
                  <ClipboardList className="h-4 w-4 text-[#696cff]" />
                  Clinical Notes & Practitioner Diagnosis
                </h4>
                
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 w-[40%]">
                    <label className="text-[10px] font-bold uppercase text-[#a1acb8]">Quick Change Status</label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value)}
                      className="h-10 rounded-xl border border-[#d9dee3] bg-white px-2.5 text-xs font-semibold text-[#566a7f]"
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-[#a1acb8]">Booked By Account</label>
                    <span className="flex h-10 items-center rounded-xl bg-[#f5f5f9] px-3 text-xs font-bold text-[#697a8d]">
                      {selectedAppointment.booked_by?.name || 'Self Scheduled'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-[#a1acb8]">Diagnosis / Prescription Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Input prescriptions, medicine quantities, or symptoms tracking details..."
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    className="rounded-xl border border-[#d9dee3] px-3 py-2 text-sm font-semibold outline-none focus:border-[#696cff]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 border-t border-[#eceef5] bg-[#f5f5f9] px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="rounded-xl border border-[#eceef5] bg-white px-4 py-2.5 text-sm font-bold text-[#697a8d] hover:bg-[#f5f5f9]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedAppointment, modalStatus, editingNotes)}
                className="rounded-xl bg-[#696cff] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:brightness-105"
              >
                Save Diagnoses & Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
