import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { POLICY } from '../test/policies'
import { ConsentModal } from './ConsentModal'

type ConsentModalProps = ComponentProps<typeof ConsentModal>

const renderModal = (props: Partial<ConsentModalProps> = {}) => {
  const onAccept = vi.fn()
  render(
    <ConsentModal
      policy={POLICY}
      isAccepting={false}
      hasError={false}
      onAccept={onAccept}
      {...props}
    />,
  )
  return { onAccept }
}

describe('ConsentModal', () => {
  it('shows the policy title, version and content', async () => {
    renderModal()

    expect(await screen.findByRole('dialog', { name: POLICY.title })).toBeInTheDocument()
    expect(screen.getByText(`Versão ${POLICY.version}`)).toBeInTheDocument()
    expect(screen.getByText(POLICY.content)).toBeInTheDocument()
  })

  it('focuses the accept button when it opens', async () => {
    renderModal()

    expect(await screen.findByRole('button', { name: 'Li e aceito' })).toHaveFocus()
  })

  it('asks for the acceptance when the button is clicked', async () => {
    const { onAccept } = renderModal()

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Li e aceito' }))

    expect(onAccept).toHaveBeenCalledOnce()
  })

  it('disables the button while the acceptance is being sent', async () => {
    renderModal({ isAccepting: true })

    expect(await screen.findByRole('button', { name: 'Enviando...' })).toBeDisabled()
  })

  it('shows an error message when the acceptance fails', async () => {
    renderModal({ hasError: true })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível registrar o aceite. Tente novamente.',
    )
  })

  it('does not show an error message by default', async () => {
    renderModal()
    await screen.findByRole('dialog')

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('stays open when the escape key is pressed', async () => {
    const { onAccept } = renderModal()
    await screen.findByRole('dialog')

    await userEvent.setup().keyboard('{Escape}')

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(onAccept).not.toHaveBeenCalled()
  })

  it('stays open when the area outside the panel is clicked', async () => {
    const { onAccept } = renderModal()
    const areaOutsidePanel = (await screen.findByRole('dialog')).lastElementChild as HTMLElement

    await userEvent.setup().click(areaOutsidePanel)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(onAccept).not.toHaveBeenCalled()
  })

  it('has no close button', async () => {
    renderModal()
    await screen.findByRole('dialog')

    expect(screen.getAllByRole('button')).toHaveLength(1)
  })
})
