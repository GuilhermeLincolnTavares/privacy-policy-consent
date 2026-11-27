import { useNotificationSettings } from '../hooks/useNotificationSettings'
import { useUpdateNotificationSettings } from '../hooks/useUpdateNotificationSettings'
import { Button } from './Button'

const HEADING_ID = 'notification-toggle-heading'
const LOAD_ERROR_MESSAGE = 'Não foi possível carregar a configuração.'
const UPDATE_ERROR_MESSAGE = 'Não foi possível alterar a notificação. Tente novamente.'

export const NotificationToggle = () => {
  const settings = useNotificationSettings()
  const updateSettings = useUpdateNotificationSettings()
  const isEnabled = settings.data?.notificationEnabled

  return (
    <section
      aria-labelledby={HEADING_ID}
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id={HEADING_ID} className="text-lg font-semibold text-slate-900">
            Notificação de política de privacidade
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Quando ativada, quem ainda não aceitou a versão vigente vê o aviso ao entrar.
          </p>
        </div>

        {settings.isPending && <p role="status" className="text-sm text-slate-500">Carregando...</p>}

        {settings.isError && (
          <div className="flex items-center gap-3">
            <p role="alert" className="text-sm text-red-700">
              {LOAD_ERROR_MESSAGE}
            </p>
            <Button type="button" variant="secondary" onClick={() => settings.refetch()}>
              Tentar de novo
            </Button>
          </div>
        )}

        {isEnabled !== undefined && (
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                isEnabled ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isEnabled ? 'Ativada' : 'Desativada'}
            </span>
            <Button
              type="button"
              variant={isEnabled ? 'secondary' : 'primary'}
              disabled={updateSettings.isPending}
              onClick={() => updateSettings.mutate(!isEnabled)}
            >
              {isEnabled ? 'Desativar notificação' : 'Ativar notificação'}
            </Button>
          </div>
        )}
      </div>

      {updateSettings.isError && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200"
        >
          {UPDATE_ERROR_MESSAGE}
        </p>
      )}
    </section>
  )
}
