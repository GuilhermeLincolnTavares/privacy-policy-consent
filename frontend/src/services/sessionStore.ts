import type { Session } from '../types/auth'

const SESSION_KEY = 'privacy-consent.session'

export const loadSession = (): Session | null => {
  const storedSession = localStorage.getItem(SESSION_KEY)
  if (!storedSession) {
    return null
  }
  try {
    return JSON.parse(storedSession) as Session
  } catch {
    clearSession()
    return null
  }
}

export const saveSession = (session: Session): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY)
}
