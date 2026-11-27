import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ROUTES } from '../routes'
import { saveSession } from '../services/sessionStore'
import { renderWithAuth } from '../test/renderWithAuth'
import { ADMIN_SESSION, USER_SESSION } from '../test/sessions'
import { ProtectedRoute } from './ProtectedRoute'

const PROTECTED_PATH = '/protected'

const renderAt = (path: string) => {
  return renderWithAuth(
    <Routes>
      <Route path={ROUTES.login} element={<p>login page</p>} />
      <Route path={ROUTES.home} element={<p>home page</p>} />
      <Route
        path={PROTECTED_PATH}
        element={
          <ProtectedRoute>
            <p>protected content</p>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.admin}
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <p>admin content</p>
          </ProtectedRoute>
        }
      />
    </Routes>,
    path,
  )
}

describe('ProtectedRoute', () => {
  it('sends visitors without a session to the login page', () => {
    renderAt(PROTECTED_PATH)

    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('shows the content to an authenticated user', () => {
    saveSession(USER_SESSION)

    renderAt(PROTECTED_PATH)

    expect(screen.getByText('protected content')).toBeInTheDocument()
  })

  it('sends a regular user away from an admin route', () => {
    saveSession(USER_SESSION)

    renderAt(ROUTES.admin)

    expect(screen.getByText('home page')).toBeInTheDocument()
    expect(screen.queryByText('admin content')).not.toBeInTheDocument()
  })

  it('shows an admin route to an administrator', () => {
    saveSession(ADMIN_SESSION)

    renderAt(ROUTES.admin)

    expect(screen.getByText('admin content')).toBeInTheDocument()
  })

  it('sends visitors without a session away from an admin route to the login page', () => {
    renderAt(ROUTES.admin)

    expect(screen.getByText('login page')).toBeInTheDocument()
  })
})
