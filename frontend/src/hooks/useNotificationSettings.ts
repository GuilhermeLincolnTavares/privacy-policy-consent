import { useQuery } from '@tanstack/react-query'
import { getNotificationSettings } from '../services/adminService'

export const NOTIFICATION_SETTINGS_QUERY_KEY = ['admin', 'settings'] as const

export const useNotificationSettings = () =>
  useQuery({ queryKey: NOTIFICATION_SETTINGS_QUERY_KEY, queryFn: getNotificationSettings })
