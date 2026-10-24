import { join } from 'node:path'
import { app, BrowserWindow, dialog, screen, shell } from 'electron'
import { AiService } from './ai'
import { ContentRepository } from './content'
import { rebuildContentIndex } from './content-sync'
import { AppDatabase } from './database'
import { registerIpc } from './ipc'
import { JudgeClient } from './judge'
import { configureLogger, getLogger } from './logger'
import { installApplicationMenu } from './menu'
import { PackManager } from './pack-manager'
import { SettingsStore } from './settings'
import { clampWindowState, loadWindowState, saveWindowState } from './window-state'

const rendererUrl = process.env.ELECTRON_RENDERER_URL
const isDevelopment = Boolean(rendererUrl)

app.setName('Base Case')

process.on('uncaughtException', (error) => {
  let logsPath = 'the app data folder'

  try {
    logsPath = join(app.getPath('userData'), 'logs')
  } catch {
    // app.getPath can fail before the app is ready.
  }

  getLogger('main').error('process.uncaught_exception', {
    message: error.stack ?? error.message,
  })

  try {
    const choice = dialog.showMessageBoxSync({
      type: 'error',
      title: 'Base Case encountered an unexpected error',
      message: error.message || 'An unexpected error occurred.',
      detail: `The app will close. Logs are in:\n${logsPath}`,
      buttons: ['Quit', 'Open logs folder'],
      defaultId: 0,
      cancelId: 0,
    })

    if (choice === 1) {
      void shell.openPath(logsPath)
    }
  } catch {
    // Never let the error dialog mask the original failure.
  } finally {
    app.exit(1)
  }
})

process.on('unhandledRejection', (reason) => {
  getLogger('main').error('process.unhandled_rejection', {
    message: reason instanceof Error ? (reason.stack ?? reason.message) : String(reason),
  })
})

function createWindow(): void {
  const log = getLogger('main')
  const userDataPath = app.getPath('userData')
  const primary = screen.getPrimaryDisplay().workArea
  const displays = screen.getAllDisplays().map((display) => display.workArea)
  const saved = clampWindowState(loadWindowState(userDataPath), displays, primary)

  const window = new BrowserWindow({
    ...(saved.x === undefined ? {} : { x: saved.x }),
    ...(saved.y === undefined ? {} : { y: saved.y }),
    width: saved.width,
    height: saved.height,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    title: 'Base Case',
    backgroundColor: '#0f1115',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  })

  if (saved.maximized) {
    window.maximize()
  }

  const persistState = (): void => {
    const bounds = window.getNormalBounds()
    saveWindowState(userDataPath, {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      maximized: window.isMaximized(),
    })
  }

  let saveTimer: NodeJS.Timeout | null = null
  const scheduleSave = (): void => {
    if (saveTimer) {
      clearTimeout(saveTimer)
    }

    saveTimer = setTimeout(() => {
      saveTimer = null
      persistState()
    }, 300)
  }

  window.on('resize', scheduleSave)
  window.on('move', scheduleSave)
  window.on('maximize', scheduleSave)
  window.on('unmaximize', scheduleSave)
  window.on('close', () => {
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
    persistState()
  })

  window.once('ready-to-show', () => {
    window.show()
    log.info('window.ready', { width: saved.width, height: saved.height })
  })

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) {
      void shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  window.webContents.on('will-navigate', (event) => {
    event.preventDefault()
  })

  window.webContents.session.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false)
  })

  if (rendererUrl) {
    void window.loadURL(rendererUrl)
  } else {
    void window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  if (isDevelopment) {
    window.webContents.openDevTools({ mode: 'detach' })
  }
}

app
  .whenReady()
  .then(async () => {
    const userDataPath = app.getPath('userData')
    const logger = configureLogger({ directory: join(userDataPath, 'logs') })
    logger.info('app.start', {
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      electron: process.versions.electron,
    })

    const content = new ContentRepository()
    const database = new AppDatabase(userDataPath)

    try {
      await rebuildContentIndex(content, database, userDataPath)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logger.error('content.load.failed', { message })
      database.close()
      dialog.showErrorBox('Base Case could not load content', message)
      app.quit()
      return
    }

    const settings = new SettingsStore(database)
    const judge = new JudgeClient()
    const ai = new AiService(database, content)
    const packs = new PackManager(userDataPath, content, database)

    await packs.cleanupStaleImports()

    registerIpc({ content, database, judge, ai, settings, packs })
    installApplicationMenu()

    app.on('before-quit', () => {
      judge.stop()
    })

    app.on('will-quit', () => {
      database.close()
      logger.info('app.stop')
    })

    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })
  .catch((error: unknown) => {
    getLogger('main').error('app.start.failed', {
      message: error instanceof Error ? (error.stack ?? error.message) : String(error),
    })
    dialog.showErrorBox(
      'Base Case could not start',
      error instanceof Error ? (error.stack ?? error.message) : String(error),
    )
    app.quit()
  })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
