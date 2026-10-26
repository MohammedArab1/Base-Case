import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const requireFromDesktop = createRequire(join(root, 'apps/desktop/package.json'))
const { _electron: electron } = requireFromDesktop('@playwright/test')
const desktopDirectory = join(root, 'apps/desktop')
const mainPath = join(desktopDirectory, 'out', 'main', 'index.js')
const frameDirectory = join(root, 'build', 'demo-frames')
const mediaDirectory = join(root, 'docs', 'assets', 'demo')
const userDataDirectory = mkdtempSync(join(tmpdir(), 'base-case-demo-'))
const frameIntervalMs = 250
let frameIndex = 0
let app = null

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function cleanEnvironment() {
  const environment = { ...process.env }
  delete environment.ELECTRON_RENDERER_URL
  delete environment.BASE_CASE_CONTENT_PATH
  delete environment.BASE_CASE_TEST_PACK_PATH
  return Object.fromEntries(Object.entries(environment).filter((entry) => entry[1] !== undefined))
}

async function capture(page) {
  await page.screenshot({
    path: join(frameDirectory, `frame-${String(frameIndex).padStart(4, '0')}.png`),
    animations: 'disabled',
  })
  frameIndex += 1
}

async function hold(page, durationMs) {
  const end = Date.now() + durationMs

  while (Date.now() < end) {
    const started = Date.now()
    await capture(page)
    await sleep(Math.max(20, frameIntervalMs - (Date.now() - started)))
  }
}

function encode() {
  if (frameIndex === 0) {
    throw new Error('No frames were captured.')
  }

  mkdirSync(mediaDirectory, { recursive: true })

  const input = join(frameDirectory, 'frame-%04d.png')
  const mp4 = join(mediaDirectory, 'base-case-demo.mp4')
  const gif = join(mediaDirectory, 'base-case-demo.gif')

  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-framerate',
      String(1000 / frameIntervalMs),
      '-i',
      input,
      '-vf',
      'scale=1280:-2:flags=lanczos',
      '-c:v',
      'libx264',
      '-preset',
      'slow',
      '-crf',
      '22',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      '-r',
      '24',
      mp4,
    ],
    { stdio: 'inherit' },
  )

  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-framerate',
      String(1000 / frameIntervalMs),
      '-i',
      input,
      '-vf',
      'fps=6,scale=900:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3',
      '-loop',
      '0',
      gif,
    ],
    { stdio: 'inherit' },
  )

  copyFileSync(join(frameDirectory, 'frame-0012.png'), join(mediaDirectory, 'poster.png'))
  console.log(`Wrote ${mp4}`)
  console.log(`Wrote ${gif}`)
}

try {
  rmSync(frameDirectory, { recursive: true, force: true })
  mkdirSync(frameDirectory, { recursive: true })

  app = await electron.launch({
    args: [mainPath, `--user-data-dir=${userDataDirectory}`],
    cwd: root,
    env: {
      ...cleanEnvironment(),
      BASE_CASE_LOG_LEVEL: 'warn',
    },
  })
  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')

  // Skip onboarding so the tour starts on the main workspace.
  await page.evaluate(async () => {
    await globalThis.baseCase.settings.update({
      onboardingCompleted: true,
      language: 'typescript',
      theme: 'light',
    })
  })
  await page.reload()
  await page.locator('.app-shell').waitFor()

  await hold(page, 1000)

  await page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('button', { name: 'Coding' })
    .click()
  await page.getByRole('heading', { name: 'Problem library' }).waitFor()
  await hold(page, 900)

  await page.getByRole('button', { name: /Pair Sum/ }).click()
  await page.getByRole('heading', { name: 'Pair Sum', level: 2 }).waitFor()
  await hold(page, 1200)

  await page.getByRole('button', { name: 'Run samples' }).click()
  await page.getByText('Wrong answer', { exact: true }).first().waitFor({ timeout: 60_000 })
  await hold(page, 1600)

  await page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('button', { name: 'Progress' })
    .click()
  await page.getByRole('heading', { name: 'Activity' }).waitFor()
  await hold(page, 1300)

  await page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('button', { name: 'System Design' })
    .click()
  await page.getByTestId('design-scenario').first().waitFor()
  await hold(page, 900)

  await page.getByTestId('design-scenario').first().click()
  await page.locator('.excalidraw__canvas.interactive').waitFor()
  await hold(page, 1400)

  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K')
  await page.locator('.command-palette').waitFor()
  await hold(page, 1000)
  await page.keyboard.press('Escape')

  await app.close()
  app = null

  encode()
  console.log(`Captured ${frameIndex} frames.`)
} finally {
  await app?.close().catch(() => undefined)
  rmSync(userDataDirectory, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })

  if (process.env.KEEP_DEMO_FRAMES !== '1') {
    rmSync(frameDirectory, { recursive: true, force: true })
  }
}
