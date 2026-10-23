import type { JSX } from 'react'
import { cn } from './cn'

interface ProgressProps {
  readonly value: number
  readonly max?: number
  readonly label?: string
  readonly className?: string
}

export function Progress({ value, max = 100, label, className }: ProgressProps): JSX.Element {
  const percent = Math.min(100, Math.max(0, max === 0 ? 0 : (value / max) * 100))

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-bc-surface-muted', className)}
    >
      <div
        className="h-full rounded-full bg-bc-accent transition-[width] duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
