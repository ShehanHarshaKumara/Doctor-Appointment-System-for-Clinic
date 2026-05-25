import { AdminMedicinesPage } from '../../admin/AdminMedicinesPage';

export function StaffMedicinesPage({ onChanged }: { onChanged: () => void }) {
  return <AdminMedicinesPage onChanged={onChanged} />;
}
