import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acceptCurrentPolicy } from '../services/consentService'
import { CONSENT_STATUS_QUERY_KEY } from './useConsentStatus'

export const useAcceptConsent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: acceptCurrentPolicy,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONSENT_STATUS_QUERY_KEY }),
  })
}
