import type { InputHTMLAttributes } from 'react'

const INPUT_STYLES =
  'mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
}

export const TextField = ({ id, label, ...inputProps }: TextFieldProps) => {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-ink">
        {label}
      </label>
      <input id={id} className={INPUT_STYLES} {...inputProps} />
    </div>
  )
}
