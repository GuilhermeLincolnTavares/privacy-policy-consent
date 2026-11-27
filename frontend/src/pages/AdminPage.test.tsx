import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ConsentGate } from '../components/ConsentGate'
import { httpClient } from '../services/httpClient'
import { ACCEPTED_USER, ADMIN_USER, PENDING_USER } from '../test/adminUsers'
import { ACCEPTED_STATUS, PENDING_STATUS } from '../test/policies'
import { renderWithAuth } from '../test/renderWithAuth'
import type { AdminUser } from '../types/admin'
import { AdminPage } from './AdminPage'

const USERS_URL = '/api/admin/users'
const SETTINGS_URL = '/api/admin/settings'
const CONSENT_STATUS_URL = '/api/consent/status'
const CONSENT_ACCEPT_URL = '/api/consent/accept'

describe('AdminPage', () => {
  let api: MockAdapter

  beforeEach(() => {
    api = new MockAdapter(httpClient)
    api.onGet(SETTINGS_URL).reply(200, { notificationEnabled: true })
  })

  afterEach(() => {
    api.restore()
  })

  it('shows the notification control and the users grid', async () => {
    api.onGet(USERS_URL).reply(200, [ACCEPTED_USER, PENDING_USER])

    renderWithAuth(<AdminPage />)

    expect(screen.getByRole('heading', { name: 'Painel administrativo' })).toBeInTheDocument()
    expect(await screen.findByText('Ativada')).toBeInTheDocument()
    expect(await screen.findByRole('row', { name: /Maria/ })).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /João/ })).toBeInTheDocument()
  })

  it('shows a loading message while the users are being fetched', () => {
    api.onGet(USERS_URL).reply(() => new Promise(() => {}))

    renderWithAuth(<AdminPage />)

    expect(screen.getByText('Carregando usuários...')).toBeInTheDocument()
  })

  it('shows an error when the users cannot be loaded and allows another attempt', async () => {
    api.onGet(USERS_URL).replyOnce(500).onGet(USERS_URL).reply(200, [ACCEPTED_USER])
    renderWithAuth(<AdminPage />)

    expect(await screen.findByText('Não foi possível carregar os usuários.')).toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByRole('row', { name: /Maria/ })).toBeInTheDocument()
  })

  it('shows the admin as accepted in the grid after accepting the policy in the modal', async () => {
    const adminAccepted: AdminUser = {
      ...ADMIN_USER,
      acceptedCurrentPolicy: true,
      acceptedAt: '2026-11-27T15:30:00Z',
    }
    api.onGet(USERS_URL).replyOnce(200, [ADMIN_USER]).onGet(USERS_URL).reply(200, [adminAccepted])
    api
      .onGet(CONSENT_STATUS_URL)
      .replyOnce(200, PENDING_STATUS)
      .onGet(CONSENT_STATUS_URL)
      .reply(200, ACCEPTED_STATUS)
    api.onPost(CONSENT_ACCEPT_URL).reply(204)
    renderWithAuth(
      <>
        <AdminPage />
        <ConsentGate />
      </>,
    )

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Li e aceito' }))

    const adminRow = await screen.findByRole('row', { name: /Admin/ })
    await waitFor(() => expect(adminRow).toHaveTextContent('Aceitou'))
  })

  it('shows a message when there are no users', async () => {
    api.onGet(USERS_URL).reply(200, [])

    renderWithAuth(<AdminPage />)

    expect(await screen.findByText('Nenhum usuário encontrado.')).toBeInTheDocument()
  })
})
