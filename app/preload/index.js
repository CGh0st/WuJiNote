import { contextBridge, ipcRenderer } from 'electron'

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', {
      windowMinimize: () => ipcRenderer.send('window-minimize'),
      windowMaximize: () => ipcRenderer.send('window-maximize'),
      windowClose: () => ipcRenderer.send('window-close'),
      setBackgroundMaterial: (material) => ipcRenderer.invoke('set-background-material', material),
      initDarkMode: () => ipcRenderer.send('init-dark-mode'),
      toggleDarkMode: () => ipcRenderer.send('toggle-dark-mode'),
      addNewRepository: (repositoryName) => ipcRenderer.invoke('add-new-repository', repositoryName),
      getRepositoryByName: (repositoryName) => ipcRenderer.invoke('get-repository-by-name', repositoryName),
      getAllRepositories: () => ipcRenderer.invoke('get-all-repositories'),
      getRepositoryById: (repositoryId) => ipcRenderer.invoke('get-repository-by-id', repositoryId),
      addNewNote: (title, repositoryId) => ipcRenderer.invoke('add-new-note', title, repositoryId),
      getNoteById: (noteId) => ipcRenderer.invoke('get-note-by-id', noteId),
      saveNoteContent: (noteId, content, currentActiveVersionId) =>
        ipcRenderer.invoke('save-note-content', noteId, content, currentActiveVersionId),
      getAllNotes: () => ipcRenderer.invoke('get-all-notes'),
      getDeletedNotes: () => ipcRenderer.invoke('get-deleted-notes'),
      getNoteVersions: (noteId) => ipcRenderer.invoke('get-note-versions', noteId),
      getNoteVersionContent: (versionId) => ipcRenderer.invoke('get-note-version-content', versionId),
      updateRepository: (repositoryId, repositoryName) =>
        ipcRenderer.invoke('update-repository', repositoryId, repositoryName),
      deleteRepository: (repositoryId) => ipcRenderer.invoke('delete-repository', repositoryId),
      deleteNote: (noteId) => ipcRenderer.invoke('delete-note', noteId),
      permanentlyDeleteNote: (noteId) => ipcRenderer.invoke('permanently-delete-note', noteId),
      restoreNote: (noteId) => ipcRenderer.invoke('restore-note', noteId),
      restoreNoteVersion: (noteId, versionId) => ipcRenderer.invoke('restore-note-version', noteId, versionId),
      deleteNoteVersion: (noteId, versionId) => ipcRenderer.invoke('delete-note-version', noteId, versionId),
      copyNote: (noteId) => ipcRenderer.invoke('copy-note', noteId),
      updateNote: (noteId, title, repositoryId) => ipcRenderer.invoke('update-note', noteId, title, repositoryId),
      toggleNoteLock: (noteId, isLocked) => ipcRenderer.invoke('toggle-note-lock', noteId, isLocked),
      checkDatabaseStatus: () => ipcRenderer.invoke('check-database-status'),
      backupDatabase: () => ipcRenderer.invoke('backup-database'),
      importDatabase: () => ipcRenderer.invoke('import-database'),
      exportNote: (noteId, format) => ipcRenderer.invoke('export-note', noteId, format),
      searchNotes: (keyword) => ipcRenderer.invoke('search-notes', keyword),
      getNoteLogs: (noteId) => ipcRenderer.invoke('get-note-logs', noteId)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  console.error('contextIsolated is false')
}
