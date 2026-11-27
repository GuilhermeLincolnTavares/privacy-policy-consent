import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acceptCurrentPolicy } from '../services/consentService'
import { ADMIN_USERS_QUERY_KEY } from './useAdminUsers'
import { CONSENT_STATUS_QUERY_KEY } from './useConsentStatus'

export const useAcceptConsent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: acceptCurrentPolicy,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: CONSENT_STATUS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY }),
      ]),
  })
}
