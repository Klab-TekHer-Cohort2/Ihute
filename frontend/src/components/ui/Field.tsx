import type { LucideIcon } from 'lucide-react'
import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface FieldProps {
  label: string
  error?: string
  hint?: string
  className?: string
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode
}

/** Label + control + error/hint, wired up for screen readers. */
export function Field({ label, error, hint, className, children }: FieldProps) {
  const id = useId()
  const msgId = `${id}-msg`
  const message = error ?? hint
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-forest-800">
        {label}
      </label>
      {children({ id, describedBy: message ? msgId : undefined, invalid: !!error })}
      {message && (
        <p id={msgId} className={cn('mt-1.5 text-xs', error ? 'text-red-700' : 'text-forest-600')}>
          {message}
        </p>
      )}
    </div>
  )
}

const controlBase =
  'w-full rounded-xl border bg-white text-[15px] text-forest-900 outline-none transition placeholder:text-forest-600/50 focus:border-brand-500 focus:ring-4 focus:ring-brand-200/60'

const controlState = (invalid?: boolean) =>
  invalid ? 'border-red-400 bg-red-50/40' : 'border-brand-200 hover:border-brand-300'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon
  invalid?: boolean
  trailing?: ReactNode
}

export function TextInput({ icon: Icon, invalid, trailing, className, ...props }: TextInputProps) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-forest-600/70" />
      )}
      <input
        aria-invalid={invalid || undefined}
        className={cn(controlBase, controlState(invalid), 'h-12', Icon ? 'pl-11' : 'pl-4', trailing ? 'pr-12' : 'pr-4', className)}
        {...props}
      />
      {trailing && <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>}
    </div>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export function Select({ invalid, className, children, ...props }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(controlBase, controlState(invalid), 'h-12 appearance-none pl-4 pr-10', className)}
      style={{
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
        backgroundSize: '16px',
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23325943' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  )
}
