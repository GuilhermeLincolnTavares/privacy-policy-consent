import { createContext } from 'react'
import type { LoginRequest, Session } from '../types/auth'

export interface AuthContextValue {
  session: Session | null
  login: (credentials: LoginRequest) => Promise<Session>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
