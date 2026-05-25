import { Appointment } from '../../../lib/api';
import { AdminAppointmentsPage } from '../../admin/AdminAppointmentsPage';

export function StaffAppointmentsPage({ appointments, onChanged }: { appointments: Appointment[]; onChanged: () => void }) {
  return <AdminAppointmentsPage appointments={appointments} onChanged={onChanged} />;
}
