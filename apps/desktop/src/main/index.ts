import { join } from 'node:path'
import { app, BrowserWindow, dialog, shell } from 'electron'
import { AiService } from './ai'
import { ContentRepository } from './content'
import { AppDatabase } from './database'
import { registerIpc } from './ipc'
import { JudgeClient } from './judge'

const rendererUrl = process.env.ELECTRON_RENDERER_URL
const isDevelopment = Boolean(rendererUrl)

app.setName('Base Case')

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
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

  window.once('ready-to-show', () => {
    window.show()
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
    const content = new ContentRepository()

    try {
      await content.initialize()
    } catch (error) {
      console.error('Base Case could not load content:', error)
      dialog.showErrorBox(
        'Base Case could not load content',
        error instanceof Error ? error.message : String(error),
      )
      app.quit()
      return
    }

    const database = new AppDatabase(app.getPath('userData'))
    const judge = new JudgeClient()
    const ai = new AiService(database, content)

    registerIpc({ content, database, judge, ai })

    app.on('before-quit', () => {
      judge.stop()
    })

    app.on('will-quit', () => {
      database.close()
    })

    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })
  .catch((error: unknown) => {
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
