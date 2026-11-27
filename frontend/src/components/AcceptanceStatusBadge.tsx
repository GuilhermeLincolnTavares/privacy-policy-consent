interface AcceptanceStatusBadgeProps {
  accepted: boolean
}

export const AcceptanceStatusBadge = ({ accepted }: AcceptanceStatusBadgeProps) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
      accepted ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
    }`}
  >
    {accepted ? 'Aceitou' : 'Pendente'}
  </span>
)
