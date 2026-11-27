import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { httpClient } from '../services/httpClient'
import { renderWithAuth } from '../test/renderWithAuth'
import { ACCEPTED_STATUS, PENDING_STATUS, POLICY } from '../test/policies'
import { ConsentGate } from './ConsentGate'

const STATUS_URL = '/api/consent/status'
const ACCEPT_URL = '/api/consent/accept'

describe('ConsentGate', () => {
  let api: MockAdapter

  beforeEach(() => {
    api = new MockAdapter(httpClient)
  })

  afterEach(() => {
    api.restore()
  })

  it('shows the modal when the API says the user must accept the policy', async () => {
    api.onGet(STATUS_URL).reply(200, PENDING_STATUS)

    renderWithAuth(<ConsentGate />)

    expect(await screen.findByRole('dialog', { name: POLICY.title })).toBeInTheDocument()
  })

  it('does not show the modal when there is nothing to accept', async () => {
    api.onGet(STATUS_URL).reply(200, ACCEPTED_STATUS)

    renderWithAuth(<ConsentGate />)

    await waitFor(() => expect(api.history.get).toHaveLength(1))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not show the modal when the status cannot be loaded', async () => {
    api.onGet(STATUS_URL).reply(500)

    renderWithAuth(<ConsentGate />)

    await waitFor(() => expect(api.history.get).toHaveLength(1))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('accepts the policy and closes the modal', async () => {
    api.onGet(STATUS_URL).replyOnce(200, PENDING_STATUS).onGet(STATUS_URL).reply(200, ACCEPTED_STATUS)
    api.onPost(ACCEPT_URL).reply(204)
    renderWithAuth(<ConsentGate />)

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Li e aceito' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(api.history.post).toHaveLength(1)
  })

  it('keeps the modal open and allows another attempt when accepting fails', async () => {
    api.onGet(STATUS_URL).reply(200, PENDING_STATUS)
    api.onPost(ACCEPT_URL).reply(500)
    renderWithAuth(<ConsentGate />)

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Li e aceito' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível registrar o aceite')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Li e aceito' })).toBeEnabled()
  })
})
