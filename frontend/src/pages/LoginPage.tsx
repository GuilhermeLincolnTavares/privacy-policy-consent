import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { Button } from '../components/Button'
import { ShieldIcon } from '../components/ShieldIcon'
import { TextField } from '../components/TextField'
import { useAuth } from '../hooks/useAuth'
import { homeRouteFor } from '../routes'
import { isUnauthorizedError } from '../services/httpClient'

const INVALID_CREDENTIALS_MESSAGE = 'E-mail ou senha inválidos.'
const GENERIC_ERROR_MESSAGE = 'Não foi possível entrar. Tente novamente.'

const DEMO_USERS = [
  { label: 'Administrador', email: 'admin@email.com', password: 'admin123' },
  { label: 'Maria', email: 'maria@email.com', password: 'maria123' },
  { label: 'João', email: 'joao@email.com', password: 'joao123' },
]

export const LoginPage = () => {
  const { session, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const loginMutation = useMutation({ mutationFn: login })

  if (session) {
    return <Navigate to={homeRouteFor(session.role)} replace />
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    loginMutation.mutate({ email, password })
  }

  const errorMessage = isUnauthorizedError(loginMutation.error)
    ? INVALID_CREDENTIALS_MESSAGE
    : GENERIC_ERROR_MESSAGE

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <ShieldIcon className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Política de Privacidade</h1>
            <p className="mt-1 text-sm text-slate-500">Entre para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              id="email"
              label="E-mail"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextField
              id="password"
              label="Senha"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {loginMutation.isError && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200"
              >
                {errorMessage}
              </p>
            )}
            <Button type="submit" disabled={loginMutation.isPending} className="w-full">
              {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>

        <div className="rounded-2xl bg-white/70 p-4 text-sm ring-1 ring-slate-200">
          <p className="mb-2 font-medium text-slate-700">Usuários de demonstração</p>
          <ul className="space-y-1">
            {DEMO_USERS.map((demoUser) => (
              <li key={demoUser.email} className="flex items-center justify-between gap-2">
                <span className="text-slate-600">
                  {demoUser.label} · {demoUser.email}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(demoUser.email)
                    setPassword(demoUser.password)
                  }}
                  className="rounded-md px-2 py-1 text-amber-700 hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  Preencher
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
