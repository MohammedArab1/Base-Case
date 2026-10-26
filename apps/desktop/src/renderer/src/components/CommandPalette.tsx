import { useEffect, useMemo, useRef, useState } from 'react'
import type { JSX, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/Dialog'
import { Input } from '../ui/Input'
import { cn } from '../ui/cn'

export interface Command {
  readonly id: string
  readonly label: string
  readonly section: string
  readonly shortcut?: string
  readonly run: () => void
}

interface CommandPaletteProps {
  readonly open: boolean
  readonly commands: readonly Command[]
  readonly onClose: () => void
}

export function CommandPalette({
  open,
  commands,
  onClose,
}: CommandPaletteProps): JSX.Element | null {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      return commands
    }

    return commands.filter((command) =>
      `${command.section} ${command.label}`.toLowerCase().includes(normalized),
    )
  }, [commands, query])

  useEffect(() => {
    if (!open) {
      return
    }

    setQuery('')
    setActiveIndex(0)
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  if (!open) {
    return null
  }

  const execute = (command: Command | undefined): void => {
    if (!command) {
      return
    }

    onClose()
    command.run()
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => (filtered.length === 0 ? 0 : (current + 1) % filtered.length))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) =>
        filtered.length === 0 ? 0 : (current - 1 + filtered.length) % filtered.length,
      )
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      execute(filtered[activeIndex])
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
    >
      <DialogContent className="command-palette flex max-h-[min(72vh,560px)] flex-col p-0">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search and run application commands.
        </DialogDescription>

        <Input
          ref={inputRef}
          className="command-input h-auto rounded-none border-0 border-b border-bc-border bg-transparent px-4 py-4 text-[15px] shadow-none focus-visible:ring-0"
          placeholder="Type a command…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-controls="command-list"
          aria-activedescendant={
            filtered[activeIndex] ? `command-option-${filtered[activeIndex].id}` : undefined
          }
        />

        <div
          id="command-list"
          className="command-list flex flex-col gap-0.5 overflow-auto p-1.5"
          role="listbox"
          aria-label="Commands"
        >
          {filtered.length === 0 ? (
            <p className="command-empty px-3 py-6 text-center text-sm text-bc-muted">
              No matching commands.
            </p>
          ) : (
            filtered.map((command, index) => (
              <button
                key={command.id}
                id={`command-option-${command.id}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={cn(
                  'command-item grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg border-0 bg-transparent px-3 py-2.5 text-left text-bc-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bc-accent',
                  index === activeIndex ? 'bg-bc-accent-soft' : 'hover:bg-bc-surface-muted',
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => execute(command)}
              >
                <span className="command-label truncate text-[13.5px]">{command.label}</span>
                <span className="command-section text-[11px] text-bc-muted">{command.section}</span>
                {command.shortcut ? (
                  <kbd className="rounded border border-bc-border px-1.5 py-0.5 font-mono text-[11px] text-bc-muted">
                    {command.shortcut}
                  </kbd>
                ) : (
                  <span />
                )}
              </button>
            ))
          )}
        </div>

        <div className="command-footer flex gap-4 border-t border-bc-border px-4 py-2.5 text-[11px] text-bc-muted">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
