import type { ComponentProps } from 'react'

type ButtonVariant = 'primary' | 'secondary'

const BASE_STYLES =
  'inline-flex items-center justify-center rounded-full px-5 py-2.5 font-display text-sm font-semibold text-ink shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-brand hover:bg-orange-400',
  secondary: 'bg-white ring-1 ring-slate-300 hover:bg-orange-50',
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
}

export const Button = ({ variant = 'primary', className = '', ...buttonProps }: ButtonProps) => (
  <button className={`${BASE_STYLES} ${VARIANT_STYLES[variant]} ${className}`} {...buttonProps} />
)
