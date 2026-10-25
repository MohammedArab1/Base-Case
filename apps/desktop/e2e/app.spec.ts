import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
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

async function capture(page: Page, name: string): Promise<void> {
  const directory = process.env.BASE_CASE_PLAYWRIGHT_SCREENSHOTS

  if (!directory) {
    return
  }

  mkdirSync(directory, { recursive: true })
  await page.screenshot({ path: join(directory, `${name}.png`) })
}

async function completeOnboarding(page: Page, language: 'python' | 'typescript'): Promise<void> {
  await page.getByTestId('onboarding-start').click()
  await page.getByTestId(`onboarding-language-${language}`).click()
  await page.getByTestId('onboarding-language-next').click()
  await page.getByTestId('onboarding-goal-30').click()
  await page.getByTestId('onboarding-goal-next').click()
  await page.getByTestId('onboarding-ai-none').click()
  await page.getByTestId('onboarding-finish').click()
  await page.getByTestId('onboarding-go-today').click()
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

    await search.fill('')
    await expect(firstPage.getByRole('button', { name: /Pair Sum/ })).toBeVisible()

    // Filters narrow the library without losing the search box.
    await firstPage.getByLabel('Difficulty filter').selectOption('hard')
    await expect(firstPage.getByRole('heading', { name: 'No matches' })).toBeVisible()
    await firstPage.getByLabel('Difficulty filter').selectOption('easy')
    await expect(firstPage.getByRole('button', { name: /Pair Sum/ })).toBeVisible()
    await firstPage.getByLabel('Status filter').selectOption('accepted')
    await expect(firstPage.getByRole('heading', { name: 'No matches' })).toBeVisible()
    await firstPage.getByLabel('Status filter').selectOption('all')

    await firstPage.getByRole('button', { name: /Pair Sum/ }).click()
    await expect(firstPage.getByRole('heading', { name: 'Pair Sum', level: 2 })).toBeVisible()

    // The inspector hosts the AI panel, notes, and attempt history.
    await expect(firstPage.getByTestId('inspector')).toBeVisible()
    await expect(firstPage.getByRole('tab', { name: 'AI' })).toBeVisible()
    await expect(firstPage.getByTestId('ai-panel')).toBeVisible()
    await expect(firstPage.getByTestId('ai-disabled')).toBeVisible()

    await firstPage.getByTestId('toggle-inspector').click()
    await expect(firstPage.getByTestId('inspector')).toHaveCount(0)
    await firstPage.getByTestId('toggle-inspector').click()
    await expect(firstPage.getByTestId('inspector')).toBeVisible()

    await firstPage.getByRole('tab', { name: 'Notes' }).click()
    const notes = firstPage.getByTestId('problem-notes')
    await notes.fill('Remember the complement.')
    await expect(firstPage.getByTestId('notes-status')).toHaveText('Saved locally')
    await capture(firstPage, 'inspector-stacked')

    await first.app.evaluate(({ BrowserWindow }) => {
      BrowserWindow.getAllWindows()[0]?.setSize(1600, 1000)
    })
    await firstPage.waitForTimeout(300)
    await capture(firstPage, 'inspector-inline')

    await firstPage.getByRole('tab', { name: 'History' }).click()
    await expect(firstPage.getByText('No attempts yet.')).toBeVisible()

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

    await secondPage.getByRole('button', { name: /Pair Sum/ }).click()
    await expect(secondPage.getByRole('heading', { name: 'Pair Sum', level: 2 })).toBeVisible()
    await secondPage.getByRole('tab', { name: 'Notes' }).click()
    await expect(secondPage.getByTestId('problem-notes')).toHaveValue('Remember the complement.')
    await capture(secondPage, 'inspector-reopened')
  } finally {
    await second?.app.close().catch(() => undefined)
    await first?.app.close().catch(() => undefined)
    rmSync(userDataDirectory, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
  }
})

test('runs the local diagnostics self-test from Settings', async () => {
  const userDataDirectory = mkdtempSync(join(tmpdir(), 'base-case-playwright-diagnostics-'))
  let launched: LaunchedApp | null = null

  try {
    launched = await launchApp(userDataDirectory)
    const page = launched.page

    await completeOnboarding(page, 'python')

    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('button', { name: 'Settings' })
      .click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

    await page.getByTestId('run-diagnostics').click()
    const report = page.getByTestId('diagnostics-report')
    await expect(report).toBeVisible({ timeout: 15_000 })
    await expect(report.locator('.runtime-row')).toHaveCount(9)
    await expect(report).toContainText('Database')
    await expect(report).toContainText('Judge sidecar')
    await expect(report).toContainText('Language runtimes')
    await expect(page.getByTestId('diagnostics-summary')).toContainText(
      'All required checks passed.',
    )
    await capture(page, 'diagnostics')
  } finally {
    await launched?.app.close().catch(() => undefined)
    rmSync(userDataDirectory, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
  }
})

test('solves, submits, reviews, grades, and tags a mistake', async () => {
  const userDataDirectory = mkdtempSync(join(tmpdir(), 'base-case-playwright-review-'))
  let launched: LaunchedApp | null = null

  try {
    launched = await launchApp(userDataDirectory)
    const page = launched.page

    await completeOnboarding(page, 'python')

    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('button', { name: 'Coding' })
      .click()
    await page.getByRole('button', { name: /Pair Sum/ }).click()
    await expect(page.getByRole('heading', { name: 'Pair Sum', level: 2 })).toBeVisible()

    await page.getByTestId('problem-plan').fill('Hash map from value to index. One pass.')

    const editor = page.locator('.cm-content')
    await editor.click()
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A')
    await page.keyboard.insertText(
      [
        'from typing import List',
        '',
        'class Solution:',
        '    def pairSum(self, nums: List[int], target: int) -> List[int]:',
        '        seen = {}',
        '        for index, value in enumerate(nums):',
        '            complement = target - value',
        '            if complement in seen:',
        '                return [seen[complement], index]',
        '            seen[value] = index',
        '        return []',
      ].join('\n'),
    )

    await page.getByRole('button', { name: 'Submit', exact: true }).click()
    await expect(page.getByText('Accepted', { exact: true }).first()).toBeVisible({
      timeout: 60_000,
    })

    // The submission created a new card for the review queue.
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('button', { name: 'Review' })
      .click()
    await expect(page.getByTestId('review-item').first()).toBeVisible()
    await expect(page.getByTestId('review-item').first()).toContainText('Pair Sum')

    // Review mode hides hints and solutions.
    await page.getByTestId('start-review').first().click()
    await expect(page.getByTestId('review-banner')).toBeVisible()
    await expect(
      page.getByText('Hints, common mistakes, and follow-ups are hidden during review.'),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Hints' })).toHaveCount(0)

    await page.getByRole('button', { name: 'Check review' }).click()
    await expect(page.getByText('Accepted', { exact: true }).first()).toBeVisible({
      timeout: 60_000,
    })
    await expect(page.getByTestId('review-grade-panel')).toBeVisible()

    await page.getByTestId('grade-good').click()
    await expect(page.getByTestId('review-empty')).toBeVisible()
    await expect(page.getByTestId('review-item')).toHaveCount(0)

    // History keeps the plan and the review attempt, and tags can be applied.
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('button', { name: 'Coding' })
      .click()
    await page.getByRole('button', { name: /Pair Sum/ }).click()
    await page.getByRole('tab', { name: 'History' }).click()
    await expect(page.getByTestId('attempt-row').first()).toContainText('Review')
    await expect(page.getByTestId('attempt-row').last()).toContainText(
      'Hash map from value to index.',
    )

    await page.getByTestId('edit-attempt-tags').first().click()
    await page.getByTestId('tag-picker').getByLabel('Off-by-one').check()
    await page.getByTestId('save-attempt-tags').click()

    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('button', { name: 'Progress' })
      .click()
    await expect(page.getByTestId('mistake-progress')).toContainText('Off-by-one')
    await capture(page, 'review-progress')
  } finally {
    await launched?.app.close().catch(() => undefined)
    rmSync(userDataDirectory, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
  }
})

test('draws, writes notes, scores the rubric, submits, and reveals the reference', async () => {
  const userDataDirectory = mkdtempSync(join(tmpdir(), 'base-case-playwright-design-'))
  let launched: LaunchedApp | null = null

  try {
    launched = await launchApp(userDataDirectory)
    const page = launched.page

    await completeOnboarding(page, 'python')

    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('button', { name: 'System Design' })
      .click()
    await expect(page.getByTestId('design-scenario').first()).toBeVisible()
    await page.getByTestId('design-scenario').first().click()
    await expect(page.getByRole('heading', { name: 'URL Shortener', level: 2 })).toBeVisible()

    // Draw a rectangle on the interactive Excalidraw canvas.
    const canvas = page.locator('.excalidraw__canvas.interactive').first()
    await expect(canvas).toBeVisible()
    await page.waitForTimeout(1500)
    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()
    // Select the tool through its label. The radio input itself is covered by
    // the icon, and the keyboard shortcut depends on canvas focus.
    await page.locator('label:has([data-testid="toolbar-rectangle"])').click()
    await page.waitForTimeout(300)
    await page.mouse.move(box!.x + 120, box!.y + 120)
    await page.mouse.down()
    await page.mouse.move(box!.x + 280, box!.y + 230, { steps: 8 })
    await page.mouse.up()
    await page.waitForTimeout(400)

    // Wait for the debounced scene autosave instead of guessing a fixed delay.
    await expect
      .poll(
        async () => {
          const draft = (await page.evaluate(
            "window.baseCase.design.getDraft('core/url-shortener')",
          )) as { sceneJson: string }
          return draft.sceneJson
        },
        { timeout: 15_000 },
      )
      .toContain('rectangle')

    await page.getByRole('tab', { name: 'Notes' }).click()
    const noteValues: Record<string, string> = {
      Requirements: '10M writes/day, 1B reads/day, 5-year retention.',
      API: 'POST /v1/links, GET /:code, DELETE /v1/links/:code.',
      'Data model': 'Links keyed by code; clicks in an append-only store.',
      'High-level architecture': 'Redirect service, cache, links store, async analytics.',
      'Deep dives': 'Key generation and the hot read path.',
      'Trade-offs': 'Random codes vs sequential ids; cache-aside vs write-through.',
      'Failure modes and monitoring': 'Cache outage falls back to the store; monitor p99.',
    }

    for (const [label, value] of Object.entries(noteValues)) {
      await page.getByLabel(label, { exact: true }).fill(value)
    }

    await page.getByRole('tab', { name: 'Rubric' }).click()
    const dimensions = [
      'Requirements and scope',
      'API design',
      'Data model and storage',
      'High-level architecture',
      'Scale and performance',
      'Trade-offs',
      'Failure modes and operations',
    ]

    for (const dimension of dimensions) {
      await page
        .getByRole('group', { name: `${dimension} score` })
        .getByRole('button', { name: '3', exact: true })
        .click()
      await page
        .getByLabel(`${dimension} evidence`, { exact: true })
        .fill('Covered in the notes and on the canvas.')
    }

    await page.getByTestId('submit-design').click()
    await expect(page.getByText('Expected topics')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Reference design: URL shortener' }),
    ).toBeVisible()

    await page.getByRole('tab', { name: 'History' }).click()
    await expect(page.getByTestId('design-attempts')).toContainText('3 / 4')

    // The submission creates a design review card that can be graded manually.
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('button', { name: 'Review' })
      .click()
    await expect(page.getByTestId('review-item').first()).toContainText('URL Shortener')
    await page.getByTestId('grade-good').first().click()
    await expect(page.getByTestId('review-message')).toBeVisible()

    // Restart: the draft, notes, and submitted attempts survive.
    await launched.app.close()
    launched = null
    launched = await launchApp(userDataDirectory)
    const reopened = launched.page

    await reopened
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('button', { name: 'System Design' })
      .click()
    await reopened.getByTestId('design-scenario').first().click()
    await expect(reopened.getByRole('heading', { name: 'URL Shortener', level: 2 })).toBeVisible()
    await expect(reopened.getByText('Expected topics')).toBeVisible()
    await reopened.getByRole('tab', { name: 'Notes' }).click()
    await expect(reopened.getByLabel('Requirements', { exact: true })).toHaveValue(
      noteValues.Requirements ?? '',
    )
    await capture(reopened, 'design-reference')
  } finally {
    await launched?.app.close().catch(() => undefined)
    rmSync(userDataDirectory, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
  }
})

test('previews and runs a mock AI hint with guardrails', async () => {
  const userDataDirectory = mkdtempSync(join(tmpdir(), 'base-case-ai-'))
  let launched: LaunchedApp | null = null

  try {
    launched = await launchApp(userDataDirectory)
    const page = launched.page

    await page.getByTestId('onboarding-start').click()
    await page.getByTestId('onboarding-language-typescript').click()
    await page.getByTestId('onboarding-language-next').click()
    await page.getByTestId('onboarding-goal-30').click()
    await page.getByTestId('onboarding-goal-next').click()
    await page.getByTestId('onboarding-ai-mock').click()
    await page.getByTestId('onboarding-finish').click()
    await page.getByTestId('onboarding-go-today').click()

    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('button', { name: 'Coding' })
      .click()
    await page.getByRole('button', { name: /Pair Sum/ }).click()
    await expect(page.getByRole('heading', { name: 'Pair Sum', level: 2 })).toBeVisible()

    // Every request goes through the context preview first.
    await page.getByTestId('ai-hint').click()
    await expect(page.getByTestId('ai-preview')).toBeVisible()
    await expect(page.getByTestId('ai-preview')).toContainText('input tokens')
    await expect(page.getByTestId('ai-preview')).toContainText('<user_code')

    await page.getByTestId('ai-send').click()
    await expect(page.getByTestId('ai-result-hint')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('ai-result-hint')).toContainText('hash-map')

    await page.getByTestId('ai-feedback-unhelpful').click()
    await expect(page.getByText('Saved locally. Thanks.')).toBeVisible()
    await capture(page, 'ai-hint')
  } finally {
    await launched?.app.close().catch(() => undefined)
    rmSync(userDataDirectory, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
  }
})
