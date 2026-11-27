import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '../routes'
import * as authService from '../services/authService'
import { loadSession, saveSession } from '../services/sessionStore'
import { axiosErrorWithStatus } from '../test/axiosErrors'
import { renderWithAuth } from '../test/renderWithAuth'
import { ADMIN_SESSION, USER_SESSION } from '../test/sessions'
import type { LoginResponse } from '../types/auth'
import { LoginPage } from './LoginPage'

vi.mock('../services/authService')

const renderLoginPage = () => {
  return renderWithAuth(
    <Routes>
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.home} element={<p>home page</p>} />
      <Route path={ROUTES.admin} element={<p>admin page</p>} />
    </Routes>,
    ROUTES.login,
  )
}

const fillAndSubmit = async (email: string, password: string) => {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('E-mail'), email)
  await user.type(screen.getByLabelText('Senha'), password)
  await user.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(authService.login).mockReset()
  })

  it('sends the credentials, stores the session and opens the home page for a regular user', async () => {
    vi.mocked(authService.login).mockResolvedValue(USER_SESSION)
    renderLoginPage()

    await fillAndSubmit('maria@email.com', 'maria123')

    expect(await screen.findByText('home page')).toBeInTheDocument()
    expect(authService.login).toHaveBeenCalledWith({
      email: 'maria@email.com',
      password: 'maria123',
    })
    expect(loadSession()).toEqual(USER_SESSION)
  })

  it('opens the admin page for an administrator', async () => {
    vi.mocked(authService.login).mockResolvedValue(ADMIN_SESSION)
    renderLoginPage()

    await fillAndSubmit('admin@email.com', 'admin123')

    expect(await screen.findByText('admin page')).toBeInTheDocument()
  })

  it('shows a message when the credentials are invalid', async () => {
    vi.mocked(authService.login).mockRejectedValue(axiosErrorWithStatus(401))
    renderLoginPage()

    await fillAndSubmit('maria@email.com', 'wrong')

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.')
    expect(loadSession()).toBeNull()
  })

  it('shows a generic message when the login fails for another reason', async () => {
    vi.mocked(authService.login).mockRejectedValue(axiosErrorWithStatus(500))
    renderLoginPage()

    await fillAndSubmit('maria@email.com', 'maria123')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível entrar. Tente novamente.',
    )
  })

  it('disables the button while the login is in progress', async () => {
    let finishLogin: (response: LoginResponse) => void = () => {}
    vi.mocked(authService.login).mockReturnValue(
      new Promise((resolve) => {
        finishLogin = resolve
      }),
    )
    renderLoginPage()

    await fillAndSubmit('maria@email.com', 'maria123')

    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled()
    finishLogin(USER_SESSION)
    await waitFor(() => expect(screen.getByText('home page')).toBeInTheDocument())
  })

  it('fills the form with a demo user', async () => {
    renderLoginPage()

    await userEvent.setup().click(screen.getAllByRole('button', { name: 'Preencher' })[0])

    expect(screen.getByLabelText('E-mail')).toHaveValue('admin@email.com')
    expect(screen.getByLabelText('Senha')).toHaveValue('admin123')
  })

  it('redirects an already authenticated user away from the login page', () => {
    saveSession(ADMIN_SESSION)

    renderLoginPage()

    expect(screen.getByText('admin page')).toBeInTheDocument()
  })
})
