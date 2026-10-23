import { forwardRef } from 'react'
import type { InputHTMLAttributes, JSX, ReactNode } from 'react'
import { cn } from './cn'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, type = 'text', ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'h-9 w-full rounded-lg border border-bc-border bg-bc-surface px-3 text-sm text-bc-text placeholder:text-bc-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bc-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bc-bg disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)

interface FieldProps {
  readonly label: ReactNode
  readonly hint?: ReactNode
  readonly error?: ReactNode
  readonly children: ReactNode
  readonly className?: string
}

export function Field({ label, hint, error, children, className }: FieldProps): JSX.Element {
  return (
    <label className={cn('flex flex-col gap-1.5 text-xs font-medium text-bc-muted', className)}>
      <span>{label}</span>
      {children}
      {error ? (
        <span className="text-[11px] font-normal text-bc-danger">{error}</span>
      ) : hint ? (
        <span className="text-[11px] font-normal">{hint}</span>
      ) : null}
    </label>
  )
}
