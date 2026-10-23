import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import type { JSX, ReactElement, ReactNode } from 'react'

interface TooltipProps {
  readonly content: ReactNode
  readonly children: ReactElement
  readonly side?: 'top' | 'right' | 'bottom' | 'left'
}

export function TooltipProvider({ children }: { readonly children: ReactNode }): JSX.Element {
  return <TooltipPrimitive.Provider delayDuration={250}>{children}</TooltipPrimitive.Provider>
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps): JSX.Element {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="z-50 rounded-md border border-bc-border bg-bc-surface px-2 py-1 text-xs text-bc-text shadow-[var(--shadow)]"
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
