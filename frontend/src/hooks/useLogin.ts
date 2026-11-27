import { useMutation } from '@tanstack/react-query'
import { useAuth } from './useAuth'

export const useLogin = () => {
  const { login } = useAuth()

  return useMutation({ mutationFn: login })
}
