import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { defaultAppSettings } from '../shared/types'
import { AppDatabase } from './database'
import { SettingsRepository } from './repositories/settings'
import { SettingsStore } from './settings'

function withStore(run: (store: SettingsStore, repository: SettingsRepository) => void): void {
  const directory = mkdtempSync(join(tmpdir(), 'base-case-settings-'))
  const database = new AppDatabase(directory)
  const repository = new SettingsRepository(database)

  try {
    run(new SettingsStore(repository), repository)
  } finally {
    database.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

describe('SettingsStore', () => {
  it('returns defaults for a fresh database', () => {
    withStore((store) => {
      expect(store.get()).toEqual(defaultAppSettings)
    })
  })

  it('merges patches and persists them across a reopen', () => {
    const directory = mkdtempSync(join(tmpdir(), 'base-case-settings-'))
    const database = new AppDatabase(directory)

    try {
      const store = new SettingsStore(new SettingsRepository(database))
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
      const persisted = new SettingsStore(new SettingsRepository(reopened)).get()
      expect(persisted.theme).toBe('dark')
      expect(persisted.editor.fontSize).toBe(16)
    } finally {
      reopened.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('falls back to defaults when the stored value is invalid', () => {
    withStore((store, repository) => {
      repository.set('app', '{"theme":"neon"}')
      expect(store.get()).toEqual(defaultAppSettings)
    })
  })

  it('preserves legacy settings that predate the onboarding flag', () => {
    withStore((store, repository) => {
      repository.set(
        'app',
        JSON.stringify({
          theme: 'dark',
          language: 'typescript',
          editor: { fontSize: 15, tabSize: 4, wordWrap: true },
          dailyGoalMinutes: 45,
          reviewReminders: false,
        }),
      )

      const settings = store.get()
      expect(settings.theme).toBe('dark')
      expect(settings.language).toBe('typescript')
      expect(settings.editor.fontSize).toBe(15)
      expect(settings.onboardingCompleted).toBe(false)
    })
  })
})
