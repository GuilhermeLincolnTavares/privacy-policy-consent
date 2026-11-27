import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '../routes'
import type { UserRole } from '../types/auth'

interface ProtectedRouteProps {
  requiredRole?: UserRole
  children: ReactNode
}

export const ProtectedRoute = ({ requiredRole, children }: ProtectedRouteProps) => {
  const { session } = useAuth()

  if (!session) {
    return <Navigate to={ROUTES.login} replace />
  }
  if (requiredRole && session.role !== requiredRole) {
    return <Navigate to={ROUTES.home} replace />
  }
  return children
}
