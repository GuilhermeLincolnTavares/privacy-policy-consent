import type { ConsentStatus, Policy } from '../types/consent'

export const POLICY: Policy = {
  version: 2,
  title: 'Política de Privacidade',
  content: 'Atualizamos nossa Política de Privacidade.',
}

export const PENDING_STATUS: ConsentStatus = { shouldShowModal: true, policy: POLICY }

export const ACCEPTED_STATUS: ConsentStatus = { shouldShowModal: false, policy: POLICY }
