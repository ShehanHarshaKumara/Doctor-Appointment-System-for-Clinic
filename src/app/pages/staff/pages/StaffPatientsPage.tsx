import { AdminPatientsPage } from '../../admin/AdminPatientsPage';

export function StaffPatientsPage({ onChanged }: { onChanged: () => void }) {
  return <AdminPatientsPage onChanged={onChanged} />;
}
