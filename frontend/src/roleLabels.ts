import type { UserRole } from './types/auth'

export const ROLE_LABELS: Record<UserRole, string> = {
  USER: 'Usuário',
  ADMIN: 'Administrador',
}
