import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ACCEPTED_USER, ADMIN_USER, PENDING_USER } from '../test/adminUsers'
import { UsersGrid } from './UsersGrid'

const COLUMN_HEADERS = ['Nome', 'E-mail', 'Perfil', 'Status', 'Aceite em']

const getRowOf = (name: string) => screen.getByRole('row', { name: new RegExp(name) })

describe('UsersGrid', () => {
  it('shows the column headers', () => {
    render(<UsersGrid users={[ACCEPTED_USER]} />)

    for (const header of COLUMN_HEADERS) {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument()
    }
  })

  it('shows one row per user with name, email and role', () => {
    render(<UsersGrid users={[ADMIN_USER, ACCEPTED_USER, PENDING_USER]} />)

    expect(screen.getAllByRole('row')).toHaveLength(4)
    expect(within(getRowOf('Admin')).getByText('admin@email.com')).toBeInTheDocument()
    expect(within(getRowOf('Admin')).getByText('Administrador')).toBeInTheDocument()
    expect(within(getRowOf('Maria')).getByText('Usuário')).toBeInTheDocument()
  })

  it('shows who accepted the current policy and when', () => {
    render(<UsersGrid users={[ACCEPTED_USER]} />)

    const row = getRowOf('Maria')
    expect(within(row).getByText('Aceitou')).toBeInTheDocument()
    expect(row).toHaveTextContent('27/11/2026')
  })

  it('shows who has not accepted yet and no acceptance date', () => {
    render(<UsersGrid users={[PENDING_USER]} />)

    const row = getRowOf('João')
    expect(within(row).getByText('Pendente')).toBeInTheDocument()
    expect(within(row).getByText('—')).toBeInTheDocument()
  })

  it('shows a message when there are no users', () => {
    render(<UsersGrid users={[]} />)

    expect(screen.getByText('Nenhum usuário encontrado.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
