import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import type { Policy } from '../types/consent'
import { Button } from './Button'
import { ShieldIcon } from './ShieldIcon'

const ACCEPT_ERROR_MESSAGE = 'Não foi possível registrar o aceite. Tente novamente.'

interface ConsentModalProps {
  policy: Policy
  isAccepting: boolean
  hasError: boolean
  onAccept: () => void
}

const keepModalOpen = (): void => {}

export const ConsentModal = ({ policy, isAccepting, hasError, onAccept }: ConsentModalProps) => (
  <Dialog open onClose={keepModalOpen} className="relative z-50">
    <DialogBackdrop className="fixed inset-0 bg-ink/50 backdrop-blur-sm" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel className="flex max-h-[90vh] w-full max-w-lg animate-modal-in flex-col rounded-2xl bg-white p-6 shadow-2xl motion-reduce:animate-none sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-ink">
            <ShieldIcon className="h-7 w-7" />
          </div>
          <DialogTitle as="h2" className="font-display text-xl font-bold text-ink">
            {policy.title}
          </DialogTitle>
          <span className="mt-2 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-ink">
            Versão {policy.version}
          </span>
        </div>

        <div className="mt-5 min-h-0">
          <div
            tabIndex={0}
            className="max-h-60 overflow-y-auto whitespace-pre-line rounded-xl bg-cream p-4 text-sm leading-relaxed text-ink ring-1 ring-slate-200"
          >
            {policy.content}
          </div>
        </div>

        {hasError && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200"
          >
            {ACCEPT_ERROR_MESSAGE}
          </p>
        )}

        <Button
          data-autofocus
          type="button"
          disabled={isAccepting}
          onClick={onAccept}
          className="mt-6 w-full py-3"
        >
          {isAccepting ? 'Enviando...' : 'Li e aceito'}
        </Button>
        <p className="mt-3 text-center text-xs text-muted">
          Você precisa aceitar para continuar.
        </p>
      </DialogPanel>
    </div>
  </Dialog>
)
