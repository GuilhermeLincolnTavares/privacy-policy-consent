export type UserRole = 'USER' | 'ADMIN'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  name: string
  role: UserRole
}

export type Session = LoginResponse
