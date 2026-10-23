import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { defaultAppSettings } from '../shared/types'
import { AppDatabase } from './database'
import { SettingsStore } from './settings'

describe('SettingsStore', () => {
  it('returns defaults for a fresh database', () => {
    const directory = mkdtempSync(join(tmpdir(), 'base-case-settings-'))
    const database = new AppDatabase(directory)

    try {
      expect(new SettingsStore(database).get()).toEqual(defaultAppSettings)
    } finally {
      database.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('merges patches and persists them across a reopen', () => {
    const directory = mkdtempSync(join(tmpdir(), 'base-case-settings-'))
    const database = new AppDatabase(directory)
    const store = new SettingsStore(database)

    try {
      const updated = store.update({
        theme: 'dark',
        editor: { fontSize: 16 },
      })

      expect(updated.theme).toBe('dark')
      expect(updated.editor.fontSize).toBe(16)
      expect(updated.editor.tabSize).toBe(defaultAppSettings.editor.tabSize)
      expect(updated.dailyGoalMinutes).toBe(defaultAppSettings.dailyGoalMinutes)
    } finally {
      database.close()
    }

    const reopened = new AppDatabase(directory)

    try {
      const persisted = new SettingsStore(reopened).get()
      expect(persisted.theme).toBe('dark')
      expect(persisted.editor.fontSize).toBe(16)
    } finally {
      reopened.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('falls back to defaults when the stored value is invalid', () => {
    const directory = mkdtempSync(join(tmpdir(), 'base-case-settings-'))
    const database = new AppDatabase(directory)

    try {
      database.setSetting('app', '{"theme":"neon"}')
      expect(new SettingsStore(database).get()).toEqual(defaultAppSettings)
    } finally {
      database.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('preserves legacy settings that predate the onboarding flag', () => {
    const directory = mkdtempSync(join(tmpdir(), 'base-case-settings-'))
    const database = new AppDatabase(directory)

    try {
      database.setSetting(
        'app',
        JSON.stringify({
          theme: 'dark',
          language: 'typescript',
          editor: { fontSize: 15, tabSize: 4, wordWrap: true },
          dailyGoalMinutes: 45,
          reviewReminders: false,
        }),
      )

      const settings = new SettingsStore(database).get()
      expect(settings.theme).toBe('dark')
      expect(settings.language).toBe('typescript')
      expect(settings.editor.fontSize).toBe(15)
      expect(settings.onboardingCompleted).toBe(false)
    } finally {
      database.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
