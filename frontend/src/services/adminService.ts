import type { AdminUser, NotificationSettings } from '../types/admin'
import { httpClient } from './httpClient'

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await httpClient.get<AdminUser[]>('/api/admin/users')
  return response.data
}

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const response = await httpClient.get<NotificationSettings>('/api/admin/settings')
  return response.data
}

export const updateNotificationSettings = async (
  notificationEnabled: boolean,
): Promise<NotificationSettings> => {
  const response = await httpClient.put<NotificationSettings>('/api/admin/settings', {
    notificationEnabled,
  })
  return response.data
}
