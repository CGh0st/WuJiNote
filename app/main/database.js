import fs from 'fs'
import Database from 'better-sqlite3'
import { join } from 'path'
import { app } from 'electron'

function initDatabase() {
  const dbPath = join(app.getPath('userData'), 'database.db')
  const db = new Database(dbPath, { verbose: console.log })
  // 创建表
  db.exec(`
    CREATE TABLE IF NOT EXISTS repositories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      createdTime DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      activeContentVersion INTEGER,
      repositoryId INTEGER,
      isDeleted BOOLEAN DEFAULT 0,
      isLocked BOOLEAN DEFAULT 0,
      createdTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (repositoryId) REFERENCES repositories (id),
      FOREIGN KEY (activeContentVersion) REFERENCES note_versions (id)
    );
  
    CREATE TABLE IF NOT EXISTS note_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      noteId INTEGER NOT NULL,
      content TEXT NOT NULL,
      versionHash TEXT NOT NULL,
      createdTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (noteId) REFERENCES notes (id)
    );

    CREATE TABLE IF NOT EXISTS note_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      noteId INTEGER NOT NULL,
      actionType TEXT NOT NULL,
      details TEXT,
      createdTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (noteId) REFERENCES notes (id)
    );
  `)

  // 初始化默认数据
  try {
    const insertDefaultRepo = db.prepare('INSERT OR IGNORE INTO repositories (id, name) VALUES (?, ?)')
    insertDefaultRepo.run(-1, '未分类')
    insertDefaultRepo.run(0, '已删除')
  } catch (error) {
    console.error('Failed to insert default repository:', error)
  }

  return db
}

let hasEnsuredDefaultRepo = false
let dbInstance = null

export function closeDatabase() {
  if (dbInstance && dbInstance.open) {
    try {
      dbInstance.close()
    } catch (error) {
      console.error('Failed to close database:', error)
    }
    dbInstance = null
  }
}

function connectDatabase() {
  if (dbInstance && dbInstance.open) {
    return dbInstance
  }

  const dbPath = join(app.getPath('userData'), 'database.db')
  // 检查数据库文件是否存在
  if (fs.existsSync(dbPath)) {
    dbInstance = new Database(dbPath, { verbose: console.log })

    // 确保默认知识库存在（针对已有数据库的情况）
    if (!hasEnsuredDefaultRepo) {
      try {
        const insertDefaultRepo = dbInstance.prepare('INSERT OR IGNORE INTO repositories (id, name) VALUES (?, ?)')
        insertDefaultRepo.run(-1, '未分类')
        insertDefaultRepo.run(0, '已删除')
        hasEnsuredDefaultRepo = true
      } catch (error) {
        console.error('Failed to ensure default repository:', error)
      }
    }

    return dbInstance
  } else {
    dbInstance = initDatabase()
    hasEnsuredDefaultRepo = true
    return dbInstance
  }
}

export default connectDatabase
