import axios from 'axios'
import { loadSession } from './sessionStore'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const HTTP_UNAUTHORIZED = 401
const AUTHORIZATION_HEADER = 'Authorization'

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler = () => {}

export const onUnauthorized = (handler: UnauthorizedHandler): void => {
  unauthorizedHandler = handler
}

export const isUnauthorizedError = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === HTTP_UNAUTHORIZED

export const httpClient = axios.create({ baseURL: API_URL })

httpClient.interceptors.request.use((config) => {
  const session = loadSession()
  if (session) {
    config.headers.set(AUTHORIZATION_HEADER, `Bearer ${session.token}`)
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const wasAuthenticated =
      axios.isAxiosError(error) && error.config?.headers.has(AUTHORIZATION_HEADER)
    if (isUnauthorizedError(error) && wasAuthenticated) {
      unauthorizedHandler()
    }
    return Promise.reject(error)
  },
)
