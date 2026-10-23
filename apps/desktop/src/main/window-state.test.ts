import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  clampWindowState,
  defaultWindowSize,
  loadWindowState,
  saveWindowState,
} from './window-state'

const primary = { x: 0, y: 0, width: 1920, height: 1080 }

describe('window state', () => {
  it('defaults when no state file exists', () => {
    const directory = mkdtempSync(join(tmpdir(), 'base-case-window-'))

    try {
      expect(loadWindowState(directory)).toEqual({ ...defaultWindowSize, maximized: false })
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('round-trips saved bounds', () => {
    const directory = mkdtempSync(join(tmpdir(), 'base-case-window-'))

    try {
      saveWindowState(directory, { x: 120, y: 80, width: 1400, height: 900, maximized: true })
      expect(loadWindowState(directory)).toEqual({
        x: 120,
        y: 80,
        width: 1400,
        height: 900,
        maximized: true,
      })
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('falls back when the saved file is invalid', () => {
    const directory = mkdtempSync(join(tmpdir(), 'base-case-window-'))

    try {
      writeFileSync(join(directory, 'window-state.json'), '{not json', 'utf8')
      expect(loadWindowState(directory)).toEqual({ ...defaultWindowSize, maximized: false })
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('recenters a window that no longer intersects a display', () => {
    const state = { x: 4000, y: 3000, width: 1280, height: 820, maximized: false }
    const clamped = clampWindowState(state, [primary], primary)

    expect(clamped.x).toBe(320)
    expect(clamped.y).toBe(130)
    expect(clamped.width).toBe(1280)
  })

  it('keeps a window that is still visible', () => {
    const state = { x: 200, y: 100, width: 1280, height: 820, maximized: false }
    expect(clampWindowState(state, [primary], primary)).toEqual(state)
  })
})
