import type { InputHTMLAttributes } from 'react'

const INPUT_STYLES =
  'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
}

export const TextField = ({ id, label, ...inputProps }: TextFieldProps) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input id={id} className={INPUT_STYLES} {...inputProps} />
    </div>
  )
}
