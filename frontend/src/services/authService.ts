import type { LoginRequest, LoginResponse } from '../types/auth'
import { httpClient } from './httpClient'

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await httpClient.post<LoginResponse>('/api/auth/login', credentials)
  return response.data
}
