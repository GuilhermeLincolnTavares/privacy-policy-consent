import type { UserRole } from './auth'

export interface AdminUser {
  id: number
  name: string
  email: string
  role: UserRole
  acceptedCurrentPolicy: boolean
  acceptedAt: string | null
}

export interface NotificationSettings {
  notificationEnabled: boolean
}
