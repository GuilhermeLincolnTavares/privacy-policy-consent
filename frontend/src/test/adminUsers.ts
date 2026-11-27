import type { AdminUser } from '../types/admin'

export const ADMIN_USER: AdminUser = {
  id: 1,
  name: 'Admin',
  email: 'admin@email.com',
  role: 'ADMIN',
  acceptedCurrentPolicy: false,
  acceptedAt: null,
}

export const ACCEPTED_USER: AdminUser = {
  id: 2,
  name: 'Maria',
  email: 'maria@email.com',
  role: 'USER',
  acceptedCurrentPolicy: true,
  acceptedAt: '2026-11-27T15:30:00Z',
}

export const PENDING_USER: AdminUser = {
  id: 3,
  name: 'João',
  email: 'joao@email.com',
  role: 'USER',
  acceptedCurrentPolicy: false,
  acceptedAt: null,
}
