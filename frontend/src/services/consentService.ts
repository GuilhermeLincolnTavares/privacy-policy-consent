import type { ConsentStatus } from '../types/consent'
import { httpClient } from './httpClient'

export const getConsentStatus = async (): Promise<ConsentStatus> => {
  const response = await httpClient.get<ConsentStatus>('/api/consent/status')
  return response.data
}

export const acceptCurrentPolicy = async (): Promise<void> => {
  await httpClient.post('/api/consent/accept')
}
