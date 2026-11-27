import { ROLE_LABELS } from '../roleLabels'
import type { AdminUser } from '../types/admin'
import { formatDateTime } from '../utils/formatDateTime'
import { AcceptanceStatusBadge } from './AcceptanceStatusBadge'

const NO_ACCEPTANCE_PLACEHOLDER = '—'
const EMPTY_MESSAGE = 'Nenhum usuário encontrado.'
const COLUMN_HEADERS = ['Nome', 'E-mail', 'Perfil', 'Status', 'Aceite em']

interface UsersGridProps {
  users: AdminUser[]
}

export const UsersGrid = ({ users }: UsersGridProps) => {
  if (users.length === 0) {
    return <p className="text-sm text-slate-500">{EMPTY_MESSAGE}</p>
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <caption className="sr-only">
          Usuários e status do aceite da política de privacidade vigente
        </caption>
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            {COLUMN_HEADERS.map((header) => (
              <th key={header} scope="col" className="px-4 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.id}>
              <th scope="row" className="whitespace-nowrap px-4 py-3 text-left font-medium text-slate-900">
                {user.name}
              </th>
              <td className="px-4 py-3 text-slate-600">{user.email}</td>
              <td className="px-4 py-3 text-slate-600">{ROLE_LABELS[user.role]}</td>
              <td className="px-4 py-3">
                <AcceptanceStatusBadge accepted={user.acceptedCurrentPolicy} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                {user.acceptedAt ? formatDateTime(user.acceptedAt) : NO_ACCEPTANCE_PLACEHOLDER}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
