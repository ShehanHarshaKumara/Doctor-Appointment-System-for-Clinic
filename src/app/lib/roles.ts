import { Role } from './api';

export function roleLabel(role: Role) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function roleDestinationLabel(role: Role) {
  if (role === 'patient') return 'Patient Web';
  return `${roleLabel(role)} Panel`;
}
