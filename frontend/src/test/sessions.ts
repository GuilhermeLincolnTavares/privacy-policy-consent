import type { Session } from '../types/auth'

export const USER_SESSION: Session = { token: 'user-token', name: 'Maria', role: 'USER' }

export const ADMIN_SESSION: Session = { token: 'admin-token', name: 'Admin', role: 'ADMIN' }
