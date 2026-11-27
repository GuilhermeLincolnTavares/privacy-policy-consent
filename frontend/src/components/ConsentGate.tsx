import { useAcceptConsent } from '../hooks/useAcceptConsent'
import { useConsentStatus } from '../hooks/useConsentStatus'
import { ConsentModal } from './ConsentModal'

export const ConsentGate = () => {
  const { data: status } = useConsentStatus()
  const acceptConsent = useAcceptConsent()

  if (!status?.shouldShowModal) {
    return null
  }

  return (
    <ConsentModal
      policy={status.policy}
      isAccepting={acceptConsent.isPending}
      hasError={acceptConsent.isError}
      onAccept={() => acceptConsent.mutate()}
    />
  )
}
