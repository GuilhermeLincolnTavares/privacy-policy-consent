import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateNotificationSettings } from '../services/adminService'
import { CONSENT_STATUS_QUERY_KEY } from './useConsentStatus'
import { NOTIFICATION_SETTINGS_QUERY_KEY } from './useNotificationSettings'

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(NOTIFICATION_SETTINGS_QUERY_KEY, settings)
      return queryClient.invalidateQueries({ queryKey: CONSENT_STATUS_QUERY_KEY })
    },
  })
}
