import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export interface WindowState {
  readonly x?: number
  readonly y?: number
  readonly width: number
  readonly height: number
  readonly maximized: boolean
}

export interface DisplayArea {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export const defaultWindowSize = { width: 1280, height: 820 } as const
const minimumWidth = 1024
const minimumHeight = 700
const stateFileName = 'window-state.json'

function finiteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

export function loadWindowState(userDataPath: string): WindowState {
  const path = join(userDataPath, stateFileName)

  if (!existsSync(path)) {
    return { ...defaultWindowSize, maximized: false }
  }

  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>
    const width = finiteNumber(parsed.width)
    const height = finiteNumber(parsed.height)

    return {
      x: finiteNumber(parsed.x),
      y: finiteNumber(parsed.y),
      width: width && width >= minimumWidth ? Math.round(width) : defaultWindowSize.width,
      height: height && height >= minimumHeight ? Math.round(height) : defaultWindowSize.height,
      maximized: parsed.maximized === true,
    }
  } catch {
    return { ...defaultWindowSize, maximized: false }
  }
}

export function saveWindowState(userDataPath: string, state: WindowState): void {
  try {
    mkdirSync(userDataPath, { recursive: true })
    writeFileSync(join(userDataPath, stateFileName), `${JSON.stringify(state, null, 2)}\n`, 'utf8')
  } catch {
    // Window state is cosmetic; never block closing the app on it.
  }
}

function intersects(left: WindowState, right: DisplayArea): boolean {
  if (left.x === undefined || left.y === undefined) {
    return true
  }

  return (
    left.x < right.x + right.width &&
    left.x + left.width > right.x &&
    left.y < right.y + right.height &&
    left.y + left.height > right.y
  )
}

/**
 * Keep a remembered window reachable when monitors or display scaling change.
 * If none of the saved bounds intersect a current display, center the window on
 * the primary display instead of restoring it off-screen.
 */
export function clampWindowState(
  state: WindowState,
  displays: readonly DisplayArea[],
  primary: DisplayArea,
): WindowState {
  const width = Math.max(minimumWidth, Math.round(state.width))
  const height = Math.max(minimumHeight, Math.round(state.height))

  if (displays.length === 0 || displays.some((display) => intersects(state, display))) {
    return { ...state, width, height }
  }

  return {
    x: Math.round(primary.x + Math.max(0, (primary.width - width) / 2)),
    y: Math.round(primary.y + Math.max(0, (primary.height - height) / 2)),
    width,
    height,
    maximized: state.maximized,
  }
}
