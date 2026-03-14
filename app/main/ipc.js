import { ipcMain, BrowserWindow, nativeTheme, app, dialog, screen } from 'electron'
import crypto from 'crypto'
import fs from 'fs'
import { join } from 'path'
import { closeDatabase } from './database'
import { handleExportNote } from './export'
import {
  addNewRepository,
  getRepositoryByName,
  getRepositoryById,
  getAllRepositories,
  updateRepository,
  deleteRepository,
  deleteNote,
  permanentlyDeleteNote,
  restoreNote,
  saveNoteContent,
  addNewNote,
  getAllNotes,
  getNoteById,
  getNoteVersions,
  getNoteVersionContent,
  getDeletedNotes,
  restoreNoteVersion,
  deleteNoteVersion,
  copyNote,
  updateNote,
  toggleNoteLock,
  searchNotes,
  getNoteLogs
} from './curd'

export function registerIpcHandlers() {
  // 获取笔记日志
  ipcMain.handle('get-note-logs', (event, noteId) => {
    const logs = getNoteLogs(noteId)
    return logs
  })

  // 搜索笔记
  ipcMain.handle('search-notes', (event, keyword) => {
    const notes = searchNotes(keyword)
    return notes
  })

  // 切换笔记锁定状态
  ipcMain.handle('toggle-note-lock', (event, noteId, isLocked) => {
    const result = toggleNoteLock(noteId, isLocked)
    return result
  })

  // 最小化窗口
  ipcMain.on('window-minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win.minimize()
  })

  // 最大化窗口
  ipcMain.on('window-maximize', (event) => {
    const mainWindow = BrowserWindow.fromWebContents(event.sender)
    if (mainWindow) {
      const { width: currentWidth, height: currentHeight } = mainWindow.getBounds()
      const { workArea } = screen.getDisplayMatching(mainWindow.getBounds())

      // 判断是否视觉上已经最大化（允许 10px 误差）
      const isVisualMaximized =
        Math.abs(currentWidth - workArea.width) < 10 && Math.abs(currentHeight - workArea.height) < 10

      // 如果已经是视觉上的最大化，则恢复到默认大小
      if (isVisualMaximized) {
        mainWindow.setBounds({
          width: 1400,
          height: 900,
          x: workArea.x + (workArea.width - 1400) / 2,
          y: workArea.y + (workArea.height - 900) / 2
        })
      } else {
        // 否则手动设置窗口大小为工作区大小（伪最大化），以保留圆角和毛玻璃效果
        mainWindow.setBounds({
          x: workArea.x,
          y: workArea.y,
          width: workArea.width,
          height: workArea.height
        })
      }
    }
  })

  ipcMain.on('window-close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win.close()
  })

  // 设置窗口背景材质
  ipcMain.handle('set-background-material', (event, material) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return { success: false, message: 'Window not found.' }
    if (process.platform !== 'win32') return { success: false, message: 'Only supported on Windows.' }
    if (typeof win.setBackgroundMaterial !== 'function') {
      return { success: false, message: 'Electron does not support setBackgroundMaterial().' }
    }

    const allowed = new Set(['none', 'mica', 'acrylic', 'tabbed'])
    if (!allowed.has(material)) return { success: false, message: 'Invalid material.' }

    try {
      win.setBackgroundMaterial(material)
      return { success: true }
    } catch (error) {
      return { success: false, message: error?.message || String(error) }
    }
  })

  // 黑暗模式切换
  ipcMain.on('toggle-dark-mode', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
    } else {
      nativeTheme.themeSource = 'dark'
    }
  })

  // 跟随系统颜色设置
  ipcMain.on('init-dark-mode', () => {
    nativeTheme.themeSource = 'system'
  })

  // 新增知识库
  ipcMain.handle('add-new-repository', (event, value) => {
    const repositoryId = addNewRepository(value)
    return repositoryId
  })

  // 查询所有知识库
  ipcMain.handle('get-all-repositories', () => {
    const repositories = getAllRepositories()
    return repositories
  })

  // 根据名称获取知识库
  ipcMain.handle('get-repository-by-name', (event, value) => {
    const repositoryId = getRepositoryByName(value)
    return repositoryId
  })

  // 根据ID获取知识库
  ipcMain.handle('get-repository-by-id', (event, value) => {
    const repository = getRepositoryById(value)
    return repository
  })

  // 更新知识库
  ipcMain.handle('update-repository', (event, repositoryId, repositoryName) => {
    const result = updateRepository(repositoryId, repositoryName)
    return result
  })

  // 删除知识库
  ipcMain.handle('delete-repository', (event, repositoryId) => {
    const result = deleteRepository(repositoryId)
    return result
  })

  // 删除笔记
  ipcMain.handle('delete-note', (event, noteId) => {
    const result = deleteNote(noteId)
    return result
  })

  // 恢复已删除笔记
  ipcMain.handle('restore-note', (event, noteId) => {
    const result = restoreNote(noteId)
    return result
  })

  // 彻底删除笔记
  ipcMain.handle('permanently-delete-note', (event, noteId) => {
    const result = permanentlyDeleteNote(noteId)
    return result
  })

  // 新建笔记
  ipcMain.handle('add-new-note', (event, title, repositoryId) => {
    const noteId = addNewNote(title, repositoryId)
    // 默认创建一个初始空版本
    const content = '<p>写点什么...</p>'
    const versionHash = crypto.createHash('md5').update(content).digest('hex')
    saveNoteContent(noteId, content, versionHash, null)
    return noteId
  })

  // 保存笔记内容
  ipcMain.handle('save-note-content', (event, noteId, content, currentActiveVersionId) => {
    const versionHash = crypto.createHash('md5').update(content).digest('hex')
    try {
      const result = saveNoteContent(noteId, content, versionHash, currentActiveVersionId)
      return { success: true, id: result }
    } catch (error) {
      console.error('Save note error:', error)
      return { success: false, error: error.message }
    }
  })

  // 更新笔记信息
  ipcMain.handle('update-note', (event, noteId, title, repositoryId) => {
    const result = updateNote(noteId, title, repositoryId)
    return result
  })

  // 查询所有笔记
  ipcMain.handle('get-all-notes', () => {
    const notes = getAllNotes()
    return notes
  })

  // 查询已删除的笔记
  ipcMain.handle('get-deleted-notes', () => {
    const notes = getDeletedNotes()
    return notes
  })

  // 根据ID获取笔记
  ipcMain.handle('get-note-by-id', (event, value) => {
    const note = getNoteById(value)
    return note
  })

  // 获取笔记版本列表
  ipcMain.handle('get-note-versions', (event, noteId) => {
    const versions = getNoteVersions(noteId)
    return versions
  })

  // 获取指定版本内容
  ipcMain.handle('get-note-version-content', (event, versionId) => {
    const content = getNoteVersionContent(versionId)
    return content
  })

  // 恢复指定版本
  ipcMain.handle('restore-note-version', (event, noteId, versionId) => {
    const result = restoreNoteVersion(noteId, versionId)
    return result
  })

  // 删除历史版本
  ipcMain.handle('delete-note-version', (event, noteId, versionId) => {
    try {
      const result = deleteNoteVersion(noteId, versionId)
      return { success: true, changes: result?.changes || 0 }
    } catch (error) {
      return { success: false, message: error?.message || String(error) }
    }
  })

  // 复制笔记
  ipcMain.handle('copy-note', (event, noteId) => {
    const newNoteId = copyNote(noteId)
    return newNoteId
  })

  // 检查数据库状态
  ipcMain.handle('check-database-status', async () => {
    const dbPath = join(app.getPath('userData'), 'database.db')
    try {
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath)
        return { exists: true, path: dbPath, size: stats.size }
      } else {
        return { exists: false, path: dbPath, size: 0 }
      }
    } catch (error) {
      return { exists: false, error: error.message }
    }
  })

  // 备份数据库
  ipcMain.handle('backup-database', async () => {
    const mainWindow = BrowserWindow.getFocusedWindow()
    const dbPath = join(app.getPath('userData'), 'database.db')
    if (!fs.existsSync(dbPath)) {
      return { success: false, message: 'Database file not found.' }
    }

    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Backup Database',
      defaultPath: `database_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`,
      filters: [{ name: 'Database', extensions: ['db'] }]
    })

    if (canceled || !filePath) {
      return { success: false, message: 'Backup canceled.' }
    }

    try {
      fs.copyFileSync(dbPath, filePath)
      return { success: true, path: filePath }
    } catch (error) {
      return { success: false, message: error.message }
    }
  })

  // 导入数据库
  ipcMain.handle('import-database', async () => {
    const mainWindow = BrowserWindow.getFocusedWindow()
    const dbPath = join(app.getPath('userData'), 'database.db')

    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Database',
      properties: ['openFile'],
      filters: [{ name: 'Database', extensions: ['db'] }]
    })

    if (canceled || filePaths.length === 0) {
      return { success: false, message: 'Import canceled.' }
    }

    try {
      // Close existing connection
      closeDatabase()

      // Backup current database just in case
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, dbPath + '.bak')
      }

      // Overwrite database
      fs.copyFileSync(filePaths[0], dbPath)

      // Notify renderer to refresh UI
      mainWindow.webContents.send('refresh-side-panel-tree')

      return { success: true }
    } catch (error) {
      // Restore backup if something failed
      if (fs.existsSync(dbPath + '.bak')) {
        try {
          fs.copyFileSync(dbPath + '.bak', dbPath)
        } catch (restoreError) {
          console.error('Failed to restore backup:', restoreError)
        }
      }
      return { success: false, message: error.message }
    }
  })

  // 导出笔记
  ipcMain.handle('export-note', handleExportNote)
}
