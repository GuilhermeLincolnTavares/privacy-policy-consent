import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { onUnauthorized } from '../services/httpClient'
import * as authService from '../services/authService'
import { clearSession, loadSession, saveSession } from '../services/sessionStore'
import type { LoginRequest, Session } from '../types/auth'
import { AuthContext } from './AuthContext'

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(loadSession)

  const queryClient = useQueryClient()

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
    queryClient.clear()
  }, [queryClient])

  const login = useCallback(async (credentials: LoginRequest) => {
    const newSession = await authService.login(credentials)
    saveSession(newSession)
    setSession(newSession)
    return newSession
  }, [])

  useEffect(() => {
    onUnauthorized(logout)
  }, [logout])

  const value = useMemo(() => ({ session, login, logout }), [session, login, logout])

  return <AuthContext value={value}>{children}</AuthContext>
}
