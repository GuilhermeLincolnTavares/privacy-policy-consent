import type { UserRole } from './types/auth'

export const ROUTES = {
  login: '/login',
  home: '/',
  admin: '/admin',
} as const

export const homeRouteFor = (role: UserRole): string =>
  role === 'ADMIN' ? ROUTES.admin : ROUTES.home
