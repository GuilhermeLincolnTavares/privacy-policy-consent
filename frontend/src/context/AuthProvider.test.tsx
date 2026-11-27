import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { describe, expect, it } from 'vitest'
import { useAuth } from '../hooks/useAuth'
import { httpClient } from '../services/httpClient'
import { createQueryClient } from '../queryClient'
import { loadSession, saveSession } from '../services/sessionStore'
import { renderWithAuth } from '../test/renderWithAuth'
import { USER_SESSION } from '../test/sessions'

const ANONYMOUS_LABEL = 'anonymous'
const CACHED_QUERY_KEY = ['cached']

const SessionStatus = () => {
  const { session, logout } = useAuth()

  return (
    <>
      <p>{session ? session.name : ANONYMOUS_LABEL}</p>
      <button type="button" onClick={logout}>
        logout
      </button>
    </>
  )
}

describe('AuthProvider', () => {
  it('starts without a session when nothing is stored', () => {
    renderWithAuth(<SessionStatus />)

    expect(screen.getByText(ANONYMOUS_LABEL)).toBeInTheDocument()
  })

  it('restores the stored session', () => {
    saveSession(USER_SESSION)

    renderWithAuth(<SessionStatus />)

    expect(screen.getByText(USER_SESSION.name)).toBeInTheDocument()
  })

  it('clears the session on logout', async () => {
    saveSession(USER_SESSION)
    renderWithAuth(<SessionStatus />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'logout' }))

    expect(screen.getByText(ANONYMOUS_LABEL)).toBeInTheDocument()
    expect(loadSession()).toBeNull()
  })

  it('clears the cached queries on logout', async () => {
    saveSession(USER_SESSION)
    const queryClient = createQueryClient()
    queryClient.setQueryData(CACHED_QUERY_KEY, 'cached value')
    renderWithAuth(<SessionStatus />, '/', queryClient)

    await userEvent.setup().click(screen.getByRole('button', { name: 'logout' }))

    expect(queryClient.getQueryData(CACHED_QUERY_KEY)).toBeUndefined()
  })

  it('logs the user out when the API rejects the token', async () => {
    saveSession(USER_SESSION)
    const api = new MockAdapter(httpClient)
    api.onGet('/api/anything').reply(401)
    renderWithAuth(<SessionStatus />)

    await act(async () => {
      await httpClient.get('/api/anything').catch(() => undefined)
    })

    expect(screen.getByText(ANONYMOUS_LABEL)).toBeInTheDocument()
    expect(loadSession()).toBeNull()
    api.restore()
  })
})
