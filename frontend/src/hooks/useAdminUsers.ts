import { useQuery } from '@tanstack/react-query'
import { getAdminUsers } from '../services/adminService'

export const ADMIN_USERS_QUERY_KEY = ['admin', 'users'] as const

export const useAdminUsers = () =>
  useQuery({ queryKey: ADMIN_USERS_QUERY_KEY, queryFn: getAdminUsers })
