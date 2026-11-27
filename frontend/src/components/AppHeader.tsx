import { NavLink } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '../routes'
import { Button } from './Button'
import { ShieldIcon } from './ShieldIcon'

const ROLE_LABELS = {
  USER: 'Usuário',
  ADMIN: 'Administrador',
} as const

const navLinkStyles = ({ isActive }: { isActive: boolean }): string => {
  const base = 'rounded-md px-3 py-2 text-sm font-medium transition'
  return isActive
    ? `${base} bg-amber-100 text-amber-800`
    : `${base} text-slate-600 hover:bg-slate-100 hover:text-slate-900`
}

export const AppHeader = () => {
  const { session, logout } = useAuth()

  if (!session) {
    return null
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldIcon className="h-6 w-6 text-amber-500" />
            <span className="font-semibold">Política de Privacidade</span>
          </div>
          <nav className="flex gap-1">
            <NavLink to={ROUTES.home} end className={navLinkStyles}>
              Início
            </NavLink>
            {session.role === 'ADMIN' && (
              <NavLink to={ROUTES.admin} className={navLinkStyles}>
                Painel admin
              </NavLink>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm leading-tight">
            <p className="font-medium text-slate-900">{session.name}</p>
            <p className="text-slate-500">{ROLE_LABELS[session.role]}</p>
          </div>
          <Button
            type="button"
            onClick={logout}
            className="bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
          >
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}
