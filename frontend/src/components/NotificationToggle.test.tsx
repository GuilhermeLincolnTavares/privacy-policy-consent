import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CONSENT_STATUS_QUERY_KEY } from '../hooks/useConsentStatus'
import { createQueryClient } from '../queryClient'
import { httpClient } from '../services/httpClient'
import { renderWithAuth } from '../test/renderWithAuth'
import { NotificationToggle } from './NotificationToggle'

const SETTINGS_URL = '/api/admin/settings'
const DISABLE_BUTTON = 'Desativar notificação'
const ENABLE_BUTTON = 'Ativar notificação'

describe('NotificationToggle', () => {
  let api: MockAdapter

  beforeEach(() => {
    api = new MockAdapter(httpClient)
  })

  afterEach(() => {
    api.restore()
  })

  it('shows the notification as enabled and offers to disable it', async () => {
    api.onGet(SETTINGS_URL).reply(200, { notificationEnabled: true })

    renderWithAuth(<NotificationToggle />)

    expect(await screen.findByText('Ativada')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: DISABLE_BUTTON })).toBeInTheDocument()
  })

  it('shows the notification as disabled and offers to enable it', async () => {
    api.onGet(SETTINGS_URL).reply(200, { notificationEnabled: false })

    renderWithAuth(<NotificationToggle />)

    expect(await screen.findByText('Desativada')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: ENABLE_BUTTON })).toBeInTheDocument()
  })

  it('sends the new value and shows the updated state', async () => {
    api.onGet(SETTINGS_URL).reply(200, { notificationEnabled: true })
    api.onPut(SETTINGS_URL).reply(200, { notificationEnabled: false })
    renderWithAuth(<NotificationToggle />)

    await userEvent.setup().click(await screen.findByRole('button', { name: DISABLE_BUTTON }))

    expect(await screen.findByText('Desativada')).toBeInTheDocument()
    expect(JSON.parse(api.history.put[0].data)).toEqual({ notificationEnabled: false })
  })

  it('refreshes the consent status after changing the notification', async () => {
    api.onGet(SETTINGS_URL).reply(200, { notificationEnabled: true })
    api.onPut(SETTINGS_URL).reply(200, { notificationEnabled: false })
    const queryClient = createQueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    renderWithAuth(<NotificationToggle />, '/', queryClient)

    await userEvent.setup().click(await screen.findByRole('button', { name: DISABLE_BUTTON }))

    await waitFor(() =>
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: CONSENT_STATUS_QUERY_KEY }),
    )
  })

  it('disables the button while the change is being sent', async () => {
    api.onGet(SETTINGS_URL).reply(200, { notificationEnabled: true })
    api.onPut(SETTINGS_URL).reply(() => new Promise(() => {}))
    renderWithAuth(<NotificationToggle />)

    await userEvent.setup().click(await screen.findByRole('button', { name: DISABLE_BUTTON }))

    await waitFor(() => expect(screen.getByRole('button', { name: DISABLE_BUTTON })).toBeDisabled())
  })

  it('shows an error and keeps the previous state when the change fails', async () => {
    api.onGet(SETTINGS_URL).reply(200, { notificationEnabled: true })
    api.onPut(SETTINGS_URL).reply(500)
    renderWithAuth(<NotificationToggle />)

    await userEvent.setup().click(await screen.findByRole('button', { name: DISABLE_BUTTON }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível alterar a notificação. Tente novamente.',
    )
    expect(screen.getByText('Ativada')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: DISABLE_BUTTON })).toBeEnabled()
  })

  it('shows an error when the settings cannot be loaded and allows another attempt', async () => {
    api
      .onGet(SETTINGS_URL)
      .replyOnce(500)
      .onGet(SETTINGS_URL)
      .reply(200, { notificationEnabled: true })
    renderWithAuth(<NotificationToggle />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar a configuração.',
    )
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByText('Ativada')).toBeInTheDocument()
  })
})
