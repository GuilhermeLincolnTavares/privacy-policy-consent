import { NavLink } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { ROLE_LABELS } from '../roleLabels'
import { ROUTES } from '../routes'
import { Button } from './Button'
import { ShieldIcon } from './ShieldIcon'

const navLinkStyles = ({ isActive }: { isActive: boolean }): string => {
  const base = 'rounded-md px-3 py-2 text-sm font-medium transition'
  return isActive
    ? `${base} bg-orange-100 text-ink`
    : `${base} text-muted hover:bg-cream hover:text-ink`
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
          <div className="flex items-center gap-2 text-ink">
            <ShieldIcon className="h-6 w-6 text-brand" />
            <span className="font-display font-bold">Energy Shield</span>
          </div>
          <nav className="flex gap-1">
            <NavLink to={ROUTES.home} end className={navLinkStyles}>
              Início
            </NavLink>
            {session.role === 'ADMIN' && (
              <NavLink to={ROUTES.admin} className={navLinkStyles}>
                Painel administrativo
              </NavLink>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm leading-tight">
            <p className="font-semibold text-ink">{session.name}</p>
            <p className="text-muted">{ROLE_LABELS[session.role]}</p>
          </div>
          <Button type="button" variant="secondary" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}
