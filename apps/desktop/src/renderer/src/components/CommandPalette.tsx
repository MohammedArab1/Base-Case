import { useEffect, useMemo, useRef, useState } from 'react'
import type { JSX, KeyboardEvent as ReactKeyboardEvent } from 'react'

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
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

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
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <input
          ref={inputRef}
          className="command-input"
          type="text"
          placeholder="Type a command…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-controls="command-list"
          aria-activedescendant={
            filtered[activeIndex] ? `command-option-${filtered[activeIndex].id}` : undefined
          }
        />

        <div id="command-list" className="command-list" role="listbox">
          {filtered.length === 0 ? (
            <p className="muted command-empty">No matching commands.</p>
          ) : (
            filtered.map((command, index) => (
              <button
                key={command.id}
                id={`command-option-${command.id}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={`command-item ${index === activeIndex ? 'is-active' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => execute(command)}
              >
                <span className="command-label">{command.label}</span>
                <span className="command-section">{command.section}</span>
                {command.shortcut ? <kbd>{command.shortcut}</kbd> : <span />}
              </button>
            ))
          )}
        </div>

        <div className="command-footer">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  )
}
