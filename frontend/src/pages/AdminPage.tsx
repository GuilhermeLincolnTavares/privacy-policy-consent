import { Button } from '../components/Button'
import { NotificationToggle } from '../components/NotificationToggle'
import { UsersGrid } from '../components/UsersGrid'
import { useAdminUsers } from '../hooks/useAdminUsers'

const USERS_HEADING_ID = 'users-heading'
const USERS_ERROR_MESSAGE = 'Não foi possível carregar os usuários.'

export const AdminPage = () => {
  const { data: users, isPending, isError, refetch } = useAdminUsers()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Painel administrativo</h1>

      <NotificationToggle />

      <section aria-labelledby={USERS_HEADING_ID} className="space-y-3">
        <h2 id={USERS_HEADING_ID} className="text-lg font-semibold text-slate-900">
          Usuários
        </h2>

        {isPending && (
          <p role="status" className="text-sm text-slate-500">
            Carregando usuários...
          </p>
        )}

        {isError && (
          <div className="flex items-center gap-3">
            <p role="alert" className="text-sm text-red-700">
              {USERS_ERROR_MESSAGE}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Tentar de novo
            </Button>
          </div>
        )}

        {users && <UsersGrid users={users} />}
      </section>
    </div>
  )
}
