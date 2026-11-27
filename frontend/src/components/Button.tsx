import type { ButtonHTMLAttributes } from 'react'

const BUTTON_STYLES =
  'inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

export const Button = ({
  className = '',
  ...buttonProps
}: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button className={`${BUTTON_STYLES} ${className}`} {...buttonProps} />
}
