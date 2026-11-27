import { AxiosHeaders, type AxiosRequestConfig, type RawAxiosHeaders } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { USER_SESSION } from '../test/sessions'
import { httpClient, isUnauthorizedError, onUnauthorized } from './httpClient'
import { saveSession } from './sessionStore'

const PATH = '/api/anything'

const headersSentIn = (request: AxiosRequestConfig): AxiosHeaders =>
  AxiosHeaders.from(request.headers as RawAxiosHeaders)

describe('httpClient', () => {
  const unauthorizedHandler = vi.fn()
  let api: MockAdapter

  beforeEach(() => {
    api = new MockAdapter(httpClient)
    unauthorizedHandler.mockClear()
    onUnauthorized(unauthorizedHandler)
  })

  afterEach(() => {
    api.restore()
  })

  it('sends the bearer token when there is a session', async () => {
    saveSession(USER_SESSION)
    api.onGet(PATH).reply(200, {})

    await httpClient.get(PATH)

    expect(headersSentIn(api.history.get[0]).get('Authorization')).toBe(
      `Bearer ${USER_SESSION.token}`,
    )
  })

  it('does not send an authorization header without a session', async () => {
    api.onGet(PATH).reply(200, {})

    await httpClient.get(PATH)

    expect(headersSentIn(api.history.get[0]).has('Authorization')).toBe(false)
  })

  it('sends the body as JSON', async () => {
    api.onPost(PATH).reply(200, {})

    await httpClient.post(PATH, { name: 'Maria' })

    expect(api.history.post[0].data).toBe(JSON.stringify({ name: 'Maria' }))
    expect(headersSentIn(api.history.post[0]).get('Content-Type')).toBe('application/json')
  })

  it('notifies when an authenticated request is rejected with 401', async () => {
    saveSession(USER_SESSION)
    api.onGet(PATH).reply(401)

    await expect(httpClient.get(PATH)).rejects.toSatisfy(isUnauthorizedError)

    expect(unauthorizedHandler).toHaveBeenCalledOnce()
  })

  it('does not notify when a 401 happens without a session, as in a failed login', async () => {
    api.onPost('/api/auth/login').reply(401)

    await expect(httpClient.post('/api/auth/login', {})).rejects.toSatisfy(isUnauthorizedError)

    expect(unauthorizedHandler).not.toHaveBeenCalled()
  })

  it('does not treat other errors as unauthorized', async () => {
    saveSession(USER_SESSION)
    api.onGet(PATH).reply(500)

    await expect(httpClient.get(PATH)).rejects.not.toSatisfy(isUnauthorizedError)

    expect(unauthorizedHandler).not.toHaveBeenCalled()
  })
})
