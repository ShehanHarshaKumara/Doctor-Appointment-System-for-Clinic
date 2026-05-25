import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const clinicButtons = {
  confirmButtonColor: '#696cff',
  cancelButtonColor: '#8592a3',
};

export function showSuccess(title: string, text?: string) {
  return Swal.fire({
    ...clinicButtons,
    icon: 'success',
    title,
    text,
    timer: 1900,
    showConfirmButton: false,
  });
}

export function showError(title: string, text?: string) {
  return Swal.fire({
    ...clinicButtons,
    icon: 'error',
    title,
    text,
  });
}

export async function confirmDelete(title: string, text: string) {
  const result = await Swal.fire({
    ...clinicButtons,
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    focusCancel: true,
  });

  return result.isConfirmed;
}
