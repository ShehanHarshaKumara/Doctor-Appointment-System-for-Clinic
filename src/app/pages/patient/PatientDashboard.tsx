import { Appointment, User } from '../../lib/api';
import { RoleDashboardPage } from '../shared/RoleDashboardPage';

export function PatientDashboard({ user, summary, appointments, onChanged }: {
  user: User;
  summary: Record<string, number>;
  appointments: Appointment[];
  onChanged: () => void;
}) {
  return <RoleDashboardPage user={user} summary={summary} appointments={appointments} onChanged={onChanged} />;
}
