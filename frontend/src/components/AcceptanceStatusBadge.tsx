import { CheckCircleIcon } from './CheckCircleIcon'
import { ClockIcon } from './ClockIcon'

interface AcceptanceStatusBadgeProps {
  accepted: boolean
}

export const AcceptanceStatusBadge = ({ accepted }: AcceptanceStatusBadgeProps) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
      accepted
        ? 'border-green-600 bg-green-50 text-green-700'
        : 'border-orange-400 bg-orange-50 text-orange-700'
    }`}
  >
    {accepted ? <CheckCircleIcon className="h-3.5 w-3.5" /> : <ClockIcon className="h-3.5 w-3.5" />}
    {accepted ? 'Aceitou' : 'Pendente'}
  </span>
)
