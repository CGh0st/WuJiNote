import icon from '../../resources/icon.png?asset'
import { join } from 'path'
import connectDatabase from './database'
import { registerIpcHandlers } from './ipc'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, shell } from 'electron'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    minWidth: 1100,
    height: 900,
    minHeight: 750,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    backgroundMaterial: 'mica',
    maximizable: false,
    transparent: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      zoomFactor: 1.0,
      contextIsolation: true,
      enablePreferredSizeMode: true,
      experimentalFeatures: true,
      backgroundThrottling: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpcHandlers()
  connectDatabase()
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
