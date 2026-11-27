import { useQuery } from '@tanstack/react-query'
import { getConsentStatus } from '../services/consentService'

export const CONSENT_STATUS_QUERY_KEY = ['consent', 'status'] as const

export const useConsentStatus = () =>
  useQuery({ queryKey: CONSENT_STATUS_QUERY_KEY, queryFn: getConsentStatus })
