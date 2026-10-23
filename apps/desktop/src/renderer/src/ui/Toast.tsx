import * as ToastPrimitive from '@radix-ui/react-toast'
import type { JSX, ReactNode } from 'react'
import { cn } from './cn'

export function ToastProvider({ children }: { readonly children: ReactNode }): JSX.Element {
  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
      {children}
      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 outline-none" />
    </ToastPrimitive.Provider>
  )
}

interface ToastProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly title: string
  readonly description?: string
  readonly tone?: 'neutral' | 'danger'
}

export function Toast({
  open,
  onOpenChange,
  title,
  description,
  tone = 'neutral',
}: ToastProps): JSX.Element {
  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        'relative rounded-lg border bg-bc-surface p-3 text-sm shadow-[var(--shadow)]',
        tone === 'danger' ? 'border-bc-danger' : 'border-bc-border',
      )}
    >
      <ToastPrimitive.Title className="font-semibold text-bc-text">{title}</ToastPrimitive.Title>
      {description ? (
        <ToastPrimitive.Description className="mt-1 text-xs text-bc-muted">
          {description}
        </ToastPrimitive.Description>
      ) : null}
      <ToastPrimitive.Close
        aria-label="Dismiss"
        className="absolute right-2 top-2 rounded border-0 bg-transparent p-1 text-bc-muted hover:bg-bc-surface-muted hover:text-bc-text"
      >
        ×
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
}
