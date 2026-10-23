import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { JSX, ReactNode } from 'react'
import { defaultAppSettings } from '../../shared/types'
import type { AppSettings, SettingsPatch, ThemePreference } from '../../shared/types'

interface SettingsContextValue {
  readonly settings: AppSettings
  readonly ready: boolean
  readonly error: string | null
  update(patch: SettingsPatch): Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | null>(null)
const themeCacheKey = 'base-case.theme'

function cachedTheme(): ThemePreference | null {
  try {
    const value = window.localStorage.getItem(themeCacheKey)
    return value === 'light' || value === 'dark' || value === 'system' ? value : null
  } catch {
    return null
  }
}

function systemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: ThemePreference): void {
  const root = document.documentElement
  const resolved = theme === 'system' ? systemTheme() : theme
  root.dataset.theme = resolved
  root.style.colorScheme = resolved
}

export function SettingsProvider({ children }: { readonly children: ReactNode }): JSX.Element {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const theme = cachedTheme()
    return theme ? { ...defaultAppSettings, theme } : defaultAppSettings
  })
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void window.baseCase.settings
      .get()
      .then((next) => {
        if (!cancelled) {
          setSettings(next)
          setReady(true)
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : String(loadError))
          setReady(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    applyTheme(settings.theme)

    try {
      window.localStorage.setItem(themeCacheKey, settings.theme)
    } catch {
      // A disabled localStorage must not break theme switching.
    }

    if (settings.theme !== 'system') {
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (): void => applyTheme('system')
    media.addEventListener('change', handleChange)

    return () => {
      media.removeEventListener('change', handleChange)
    }
  }, [settings.theme])

  const update = useCallback(async (patch: SettingsPatch): Promise<void> => {
    const next = await window.baseCase.settings.update(patch)
    setSettings(next)
    setError(null)
  }, [])

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, ready, error, update }),
    [settings, ready, error, update],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext)

  if (!value) {
    throw new Error('useSettings must be used inside SettingsProvider')
  }

  return value
}
