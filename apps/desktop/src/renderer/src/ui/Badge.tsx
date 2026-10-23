import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, JSX } from 'react'
import { cn } from './cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'border-bc-border bg-bc-surface-muted text-bc-muted',
        accent: 'border-bc-border bg-bc-accent-soft text-bc-accent',
        success: 'border-bc-border bg-bc-success-soft text-bc-success',
        danger: 'border-bc-border bg-bc-danger-soft text-bc-danger',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
)

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, tone, ...props }: BadgeProps): JSX.Element {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
