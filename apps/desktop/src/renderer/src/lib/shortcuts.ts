export interface Shortcut {
  readonly key: string
  readonly meta?: boolean
  readonly shift?: boolean
  readonly alt?: boolean
}

export const shortcuts = {
  commandPalette: { key: 'k', meta: true },
  runSamples: { key: 'Enter', meta: true },
  submit: { key: 'Enter', meta: true, shift: true },
  nextHint: { key: 'h', meta: true },
  explainFailure: { key: 'e', meta: true },
  toggleAiPanel: { key: 'j', meta: true },
  searchProblems: { key: 'p', meta: true },
} as const satisfies Record<string, Shortcut>

export type ShortcutId = keyof typeof shortcuts

export function isMacPlatform(): boolean {
  if (typeof window !== 'undefined' && window.baseCase?.platform) {
    return window.baseCase.platform === 'darwin'
  }

  return typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)
}

export function matchesShortcut(event: KeyboardEvent, shortcut: Shortcut): boolean {
  const primary = isMacPlatform() ? event.metaKey : event.ctrlKey
  const otherMeta = isMacPlatform() ? event.ctrlKey : event.metaKey

  return (
    primary === Boolean(shortcut.meta) &&
    !otherMeta &&
    event.shiftKey === Boolean(shortcut.shift) &&
    event.altKey === Boolean(shortcut.alt) &&
    event.key.toLowerCase() === shortcut.key.toLowerCase()
  )
}

function displayKey(key: string): string {
  return key.length === 1 ? key.toUpperCase() : key
}

export function shortcutLabel(shortcut: Shortcut): string {
  const mac = isMacPlatform()
  const parts: string[] = []

  if (shortcut.meta) {
    parts.push(mac ? '⌘' : 'Ctrl')
  }
  if (shortcut.shift) {
    parts.push(mac ? '⇧' : 'Shift')
  }
  if (shortcut.alt) {
    parts.push(mac ? '⌥' : 'Alt')
  }

  parts.push(displayKey(shortcut.key))
  return mac ? parts.join('') : parts.join('+')
}
