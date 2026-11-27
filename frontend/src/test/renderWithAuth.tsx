import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'
import { AuthProvider } from '../context/AuthProvider'
import { createQueryClient } from '../queryClient'

export const renderWithAuth = (
  ui: ReactElement,
  initialPath = '/',
  queryClient: QueryClient = createQueryClient(),
) =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>{ui}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
