import { defaultAppSettings } from '../shared/types'
import type { AppSettings, SettingsPatch } from '../shared/types'
import { appSettingsSchema, settingsPatchSchema } from './ipc-schemas'
import type { SettingsRepository } from './repositories/settings'

const settingsKey = 'app'

/**
 * Persisted application preferences. Reads are validated so a hand-edited or
 * downgraded database falls back to defaults instead of crashing the UI.
 */
export class SettingsStore {
  constructor(private readonly repository: SettingsRepository) {}

  get(): AppSettings {
    const raw = this.repository.get(settingsKey)

    if (!raw) {
      return defaultAppSettings
    }

    try {
      const parsed = appSettingsSchema.safeParse(JSON.parse(raw) as unknown)
      return parsed.success ? parsed.data : defaultAppSettings
    } catch {
      return defaultAppSettings
    }
  }

  update(patch: SettingsPatch): AppSettings {
    const validatedPatch = settingsPatchSchema.parse(patch)
    const current = this.get()
    const next = appSettingsSchema.parse({
      ...current,
      ...validatedPatch,
      editor: {
        ...current.editor,
        ...validatedPatch.editor,
      },
      aiFeatures: {
        ...current.aiFeatures,
        ...validatedPatch.aiFeatures,
      },
    })

    this.repository.set(settingsKey, JSON.stringify(next))
    return next
  }
}
