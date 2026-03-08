import connectDatabase from './database'

// 通过知识库名称查询知识库
export function getRepositoryByName(repositoryName) {
  const db = connectDatabase()
  const stmt = db.prepare('SELECT * FROM repositories WHERE name = ?')
  const result = stmt.get(repositoryName)
  if (!result) {
    return null
  }
  return result
}

// 通过知识库ID查询知识库
export function getRepositoryById(repositoryId) {
  const db = connectDatabase()
  const stmt = db.prepare('SELECT * FROM repositories WHERE id = ?')
  const result = stmt.get(repositoryId)
  if (!result) {
    return null
  }
  return result
}

// 新增知识库
export function addNewRepository(repositoryName) {
  const db = connectDatabase()
  const stmt = db.prepare('INSERT INTO repositories (name) VALUES (?)')
  return stmt.run(repositoryName).lastInsertRowid
}

// 查询所有知识库
export function getAllRepositories() {
  const db = connectDatabase()
  const stmt = db.prepare('SELECT * FROM repositories')
  const result = stmt.all()
  return result
}

// 删除知识库
export function deleteRepository(repositoryId) {
  const db = connectDatabase()

  if (!repositoryId) {
    throw new Error('无效的知识库ID')
  }

  // 禁止删除默认知识库
  if (Number(repositoryId) === 99999) {
    throw new Error('默认知识库不能删除')
  }

  const deleteTransaction = db.transaction((repoId) => {
    // 1. 将该知识库下的所有笔记移动到"未分类" (id: -1)
    const moveNotesStmt = db.prepare('UPDATE notes SET repositoryId = -1 WHERE repositoryId = ?')
    moveNotesStmt.run(repoId)

    // 2. 删除知识库
    const deleteRepoStmt = db.prepare('DELETE FROM repositories WHERE id = ?')
    return deleteRepoStmt.run(repoId)
  })

  return deleteTransaction(repositoryId)
}

// 更新知识库
export function updateRepository(repositoryId, repositoryName) {
  const db = connectDatabase()
  const stmt = db.prepare('UPDATE repositories SET name = ? WHERE id = ?')
  return stmt.run(repositoryName, repositoryId)
}

// 新增笔记
export function addNewNote(title, repositoryId) {
  const db = connectDatabase()
  const stmt = db.prepare('INSERT INTO notes (title, repositoryId) VALUES (?, ?)')
  const result = stmt.run(title, repositoryId)
  const noteId = result.lastInsertRowid

  addNoteLog(noteId, 'create', '创建笔记')
  return noteId
}

// 保存笔记内容
export function saveNoteContent(noteId, content, versionHash, currentActiveVersionId) {
  const db = connectDatabase()

  // 1. 校验当前编辑版本是否为最新
  const noteStmt = db.prepare('SELECT activeContentVersion FROM notes WHERE id = ?')
  const note = noteStmt.get(noteId)

  if (!note) {
    throw new Error('笔记不存在')
  }

  // 如果 activeContentVersion 为 null (新笔记) 或 undefined，允许保存
  // 如果 currentActiveVersionId 存在且与数据库中不一致，则抛出错误
  if (note.activeContentVersion && currentActiveVersionId && note.activeContentVersion !== currentActiveVersionId) {
    throw new Error('版本冲突：当前编辑的内容不是最新版本，请刷新后重试。')
  }

  // 检查是否已存在相同的 hash
  const checkStmt = db.prepare('SELECT id FROM note_versions WHERE noteId = ? AND versionHash = ?')
  const existingVersion = checkStmt.get(noteId, versionHash)

  if (existingVersion) {
    // 如果存在相同 hash，不保存，直接返回 null
    return null
  }

  const stmt = db.prepare('INSERT INTO note_versions (noteId, content, versionHash) VALUES (?, ?, ?)')
  const result = stmt.run(noteId, content, versionHash)
  // 更新笔记的 activeContentVersion
  const updateStmt = db.prepare('UPDATE notes SET activeContentVersion = ? WHERE id = ?')
  updateStmt.run(result.lastInsertRowid, noteId)

  addNoteLog(noteId, 'update_content', '更新内容')

  return result.lastInsertRowid
}

// 更新笔记信息（标题、所属知识库）
export function updateNote(noteId, title, repositoryId) {
  const db = connectDatabase()

  // Fetch old note to compare
  const oldNote = db.prepare('SELECT title, repositoryId FROM notes WHERE id = ?').get(noteId)

  const stmt = db.prepare('UPDATE notes SET title = ?, repositoryId = ?, updatedTime = CURRENT_TIMESTAMP WHERE id = ?')
  const result = stmt.run(title, repositoryId, noteId)

  if (oldNote) {
    if (oldNote.title !== title) {
      addNoteLog(noteId, 'rename', `重命名: ${oldNote.title} -> ${title}`)
    }
    if (oldNote.repositoryId !== repositoryId) {
      const repoStmt = db.prepare('SELECT name FROM repositories WHERE id = ?')
      const oldRepo = repoStmt.get(oldNote.repositoryId)
      const newRepo = repoStmt.get(repositoryId)
      const oldRepoName = oldRepo ? oldRepo.name : '未知'
      const newRepoName = newRepo ? newRepo.name : '未知'
      addNoteLog(noteId, 'move', `移动: ${oldRepoName} -> ${newRepoName}`)
    }
  }

  return result
}

// 查询所有笔记
export function getAllNotes() {
  const db = connectDatabase()
  const stmt = db.prepare('SELECT * FROM notes WHERE isDeleted = 0 OR isDeleted IS NULL')
  const result = stmt.all()
  return result
}

// 删除笔记（软删除）
export function deleteNote(noteId) {
  const db = connectDatabase()
  const stmt = db.prepare('UPDATE notes SET isDeleted = 1, updatedTime = CURRENT_TIMESTAMP WHERE id = ?')
  const result = stmt.run(noteId)
  addNoteLog(noteId, 'delete', '删除笔记')
  return result
}

// 恢复已删除笔记
export function restoreNote(noteId) {
  const db = connectDatabase()
  const stmt = db.prepare('UPDATE notes SET isDeleted = 0, updatedTime = CURRENT_TIMESTAMP WHERE id = ?')
  const result = stmt.run(noteId)
  addNoteLog(noteId, 'restore', '恢复笔记')
  return result
}

// 彻底删除笔记
export function permanentlyDeleteNote(noteId) {
  const db = connectDatabase()
  const deleteTransaction = db.transaction((id) => {
    // 1. 解除 activeContentVersion 外键关联（防止删除 note_versions 时报错）
    const updateStmt = db.prepare('UPDATE notes SET activeContentVersion = NULL WHERE id = ?')
    updateStmt.run(id)

    // 2. 删除该笔记的所有版本
    const deleteVersionsStmt = db.prepare('DELETE FROM note_versions WHERE noteId = ?')
    deleteVersionsStmt.run(id)

    // 3. 删除所有日志
    const deleteLogsStmt = db.prepare('DELETE FROM note_logs WHERE noteId = ?')
    deleteLogsStmt.run(id)

    // 4. 删除笔记本身
    const deleteNoteStmt = db.prepare('DELETE FROM notes WHERE id = ?')
    return deleteNoteStmt.run(id)
  })
  return deleteTransaction(noteId)
}

// 查询已删除笔记
export function getDeletedNotes() {
  const db = connectDatabase()
  const stmt = db.prepare(`
    SELECT notes.id, notes.title, notes.updatedTime as deleteTime, notes.repositoryId, repositories.name as repositoryName
    FROM notes
    LEFT JOIN repositories ON notes.repositoryId = repositories.id
    WHERE notes.isDeleted = 1
    ORDER BY notes.updatedTime DESC
  `)
  return stmt.all()
}

// 搜索笔记
export function searchNotes(keyword) {
  const db = connectDatabase()
  const searchTerm = `%${keyword}%`
  const stmt = db.prepare(`
    SELECT notes.id, notes.title, note_versions.content, notes.updatedTime, notes.repositoryId, repositories.name as repositoryName
    FROM notes
    LEFT JOIN repositories ON notes.repositoryId = repositories.id
    LEFT JOIN note_versions ON notes.activeContentVersion = note_versions.id
    WHERE (notes.title LIKE ? OR note_versions.content LIKE ?) AND (notes.isDeleted = 0 OR notes.isDeleted IS NULL)
    ORDER BY notes.updatedTime DESC
  `)
  return stmt.all(searchTerm, searchTerm)
}

// 切换笔记锁定状态
export function toggleNoteLock(noteId, isLocked) {
  const db = connectDatabase()
  const stmt = db.prepare('UPDATE notes SET isLocked = ?, updatedTime = CURRENT_TIMESTAMP WHERE id = ?')
  const result = stmt.run(isLocked ? 1 : 0, noteId)
  addNoteLog(noteId, isLocked ? 'lock' : 'unlock', isLocked ? '锁定笔记' : '解锁笔记')
  return result
}

// 通过ID查询笔记
export function getNoteById(noteId) {
  const db = connectDatabase()
  const stmt = db.prepare(`
    SELECT notes.*, note_versions.content, repositories.name as repositoryName
    FROM notes 
    LEFT JOIN note_versions ON notes.activeContentVersion = note_versions.id 
    LEFT JOIN repositories ON notes.repositoryId = repositories.id
    WHERE notes.id = ?
  `)
  const result = stmt.get(noteId)
  if (!result) {
    return null
  }
  return result
}

// 获取笔记的所有版本列表
export function getNoteVersions(noteId) {
  const db = connectDatabase()
  const stmt = db.prepare('SELECT * FROM note_versions WHERE noteId = ? ORDER BY createdTime DESC')
  const result = stmt.all(noteId)
  return result
}

// 获取指定版本的笔记内容
export function getNoteVersionContent(versionId) {
  const db = connectDatabase()
  const stmt = db.prepare('SELECT content FROM note_versions WHERE id = ?')
  const result = stmt.get(versionId)
  return result ? result.content : null
}

// 恢复指定版本为当前版本
export function restoreNoteVersion(noteId, versionId) {
  const db = connectDatabase()
  const updateStmt = db.prepare(
    'UPDATE notes SET activeContentVersion = ?, updatedTime = CURRENT_TIMESTAMP WHERE id = ?'
  )
  const result = updateStmt.run(versionId, noteId)
  addNoteLog(noteId, 'restore_version', '恢复历史版本')
  return result
}

// 复制笔记
export function copyNote(noteId) {
  const db = connectDatabase()
  const copyTransaction = db.transaction((id) => {
    // 1. 获取源笔记信息
    const sourceNoteStmt = db.prepare('SELECT * FROM notes WHERE id = ?')
    const sourceNote = sourceNoteStmt.get(id)
    if (!sourceNote) throw new Error('Note not found')

    // 2. 获取源笔记的当前活跃版本内容
    let content = ''
    if (sourceNote.activeContentVersion) {
      const versionStmt = db.prepare('SELECT content FROM note_versions WHERE id = ?')
      const version = versionStmt.get(sourceNote.activeContentVersion)
      if (version) content = version.content
    }

    // 3. 创建新笔记
    const newNoteStmt = db.prepare('INSERT INTO notes (title, repositoryId) VALUES (?, ?)')
    const newNoteResult = newNoteStmt.run(`${sourceNote.title} - 副本`, sourceNote.repositoryId)
    const newNoteId = newNoteResult.lastInsertRowid

    // 4. 创建初始版本
    // 使用 import crypto from 'crypto' 已经在文件头部，这里假设已有
    // 如果 content 为空，hash 也需要生成
    const crypto = require('crypto')
    const versionHash = crypto.createHash('md5').update(content).digest('hex')

    const newVersionStmt = db.prepare('INSERT INTO note_versions (noteId, content, versionHash) VALUES (?, ?, ?)')
    const newVersionResult = newVersionStmt.run(newNoteId, content, versionHash)

    // 5. 更新新笔记的 activeContentVersion
    const updateNoteStmt = db.prepare('UPDATE notes SET activeContentVersion = ? WHERE id = ?')
    updateNoteStmt.run(newVersionResult.lastInsertRowid, newNoteId)

    addNoteLog(newNoteId, 'create', `复制自: ${sourceNote.title}`)

    return newNoteId
  })
  return copyTransaction(noteId)
}

// 记录笔记日志
export function addNoteLog(noteId, actionType, details) {
  try {
    const db = connectDatabase()
    const stmt = db.prepare('INSERT INTO note_logs (noteId, actionType, details) VALUES (?, ?, ?)')
    stmt.run(noteId, actionType, details)
  } catch (error) {
    console.error('Failed to add note log:', error)
  }
}

// 获取笔记日志
export function getNoteLogs(noteId) {
  const db = connectDatabase()
  const stmt = db.prepare('SELECT * FROM note_logs WHERE noteId = ? ORDER BY createdTime DESC')
  return stmt.all(noteId)
}
