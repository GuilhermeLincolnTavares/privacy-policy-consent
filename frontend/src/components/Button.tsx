import type { ComponentProps } from 'react'

type ButtonVariant = 'primary' | 'secondary'

const BASE_STYLES =
  'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-amber-500 text-slate-900 hover:bg-amber-400',
  secondary: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50',
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
}

export const Button = ({ variant = 'primary', className = '', ...buttonProps }: ButtonProps) => (
  <button className={`${BASE_STYLES} ${VARIANT_STYLES[variant]} ${className}`} {...buttonProps} />
)
