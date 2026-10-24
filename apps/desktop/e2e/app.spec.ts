import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { _electron as electron, expect, test } from '@playwright/test'
import type { ElectronApplication, Page } from '@playwright/test'

const desktopDirectory = join(__dirname, '..')
const mainPath = join(desktopDirectory, 'out', 'main', 'index.js')

interface LaunchedApp {
  readonly app: ElectronApplication
  readonly page: Page
}

function cleanEnvironment(): Record<string, string> {
  const environment = { ...process.env }

  // A dev server or a test-only content override must not leak into this run.
  delete environment.ELECTRON_RENDERER_URL
  delete environment.BASE_CASE_CONTENT_PATH
  delete environment.BASE_CASE_TEST_PACK_PATH

  return Object.fromEntries(
    Object.entries(environment).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  )
}

async function launchApp(userDataDirectory: string): Promise<LaunchedApp> {
  const app = await electron.launch({
    args: [mainPath, `--user-data-dir=${userDataDirectory}`],
    cwd: join(desktopDirectory, '..', '..'),
    env: {
      ...cleanEnvironment(),
      BASE_CASE_LOG_LEVEL: 'warn',
    },
  })
  const page = await app.firstWindow()

  await page.waitForLoadState('domcontentloaded')
  return { app, page }
}

test('onboards, persists the theme, searches, and reopens without onboarding', async () => {
  const userDataDirectory = mkdtempSync(join(tmpdir(), 'base-case-playwright-'))
  let first: LaunchedApp | null = null
  let second: LaunchedApp | null = null

  try {
    first = await launchApp(userDataDirectory)
    const firstPage = first.page

    // Onboarding appears only on a fresh profile.
    await expect(firstPage.getByTestId('onboarding-start')).toBeVisible()
    await firstPage.getByTestId('onboarding-start').click()

    await firstPage.getByTestId('onboarding-language-typescript').click()
    await firstPage.getByTestId('onboarding-language-next').click()

    await firstPage.getByTestId('onboarding-goal-45').click()
    await firstPage.getByTestId('onboarding-goal-next').click()

    await firstPage.getByTestId('onboarding-ai-none').click()
    await firstPage.getByTestId('onboarding-finish').click()

    await expect(firstPage.getByText("You're set.")).toBeVisible()
    await firstPage.getByTestId('onboarding-go-today').click()

    await expect(firstPage.locator('.app-shell')).toBeVisible()
    await expect(firstPage.getByRole('heading', { name: 'Today' })).toBeVisible()

    // Change the theme in Settings and wait for the persisted value to apply.
    await firstPage
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('button', { name: 'Settings' })
      .click()
    await expect(firstPage.getByRole('heading', { name: 'Settings' })).toBeVisible()

    await firstPage.getByLabel('Theme', { exact: true }).selectOption('dark')
    await expect(firstPage.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(firstPage.getByLabel('Theme', { exact: true })).toHaveValue('dark')

    // FTS search: "distinct" appears only in the statement body, not in the
    // title, slug, or patterns that the local filter matches.
    await firstPage
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('button', { name: 'Coding' })
      .click()
    await expect(firstPage.getByRole('heading', { name: 'Problem library' })).toBeVisible()

    const search = firstPage.getByRole('searchbox', { name: 'Search problems' })
    await search.fill('distinct')
    await expect(firstPage.getByRole('button', { name: /Pair Sum/ })).toBeVisible()

    await search.fill('zzzz-no-match')
    await expect(firstPage.getByRole('heading', { name: 'No matches' })).toBeVisible()

    // Relaunch with the same profile. Onboarding must not return, and the
    // onboarding choices plus the theme must survive.
    await first.app.close()
    first = null

    second = await launchApp(userDataDirectory)
    const secondPage = second.page

    await expect(secondPage.locator('.app-shell')).toBeVisible()
    await expect(secondPage.locator('.onboarding-shell')).toHaveCount(0)
    await expect(secondPage.locator('html')).toHaveAttribute('data-theme', 'dark')

    await secondPage
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('button', { name: 'Settings' })
      .click()
    await expect(secondPage.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(secondPage.getByLabel('Theme', { exact: true })).toHaveValue('dark')
    await expect(secondPage.getByLabel('Preferred language', { exact: true })).toHaveValue(
      'typescript',
    )
    await expect(secondPage.getByLabel('Daily goal', { exact: true })).toHaveValue('45')

    await secondPage
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('button', { name: 'Coding' })
      .click()
    await expect(secondPage.getByRole('heading', { name: 'Problem library' })).toBeVisible()
    await expect(secondPage.getByRole('button', { name: /Pair Sum/ })).toBeVisible()
  } finally {
    await second?.app.close().catch(() => undefined)
    await first?.app.close().catch(() => undefined)
    rmSync(userDataDirectory, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
  }
})
