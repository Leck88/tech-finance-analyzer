import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// 数据库文件路径
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'config.db')

// 确保 data 目录存在
const dbDir = path.dirname(DB_PATH)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// 创建数据库连接
const db = new Database(DB_PATH)

// 初始化数据库表
db.exec(`
  CREATE TABLE IF NOT EXISTS api_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS execution_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_type TEXT NOT NULL,
    status TEXT NOT NULL,
    result TEXT,
    error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

// API 配置相关函数
export function getConfig(key: string): string | null {
  const stmt = db.prepare('SELECT value FROM api_config WHERE key = ?')
  const row = stmt.get(key) as { value: string } | undefined
  return row?.value || null
}

export function setConfig(key: string, value: string, description?: string): boolean {
  const stmt = db.prepare(`
    INSERT INTO api_config (key, value, description, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
  `)
  try {
    stmt.run(key, value, description || '', value)
    return true
  } catch (error) {
    console.error('Failed to set config:', error)
    return false
  }
}

export function getAllConfigs(): Record<string, string> {
  const stmt = db.prepare('SELECT key, value FROM api_config')
  const rows = stmt.all() as { key: string, value: string }[]
  const configs: Record<string, string> = {}
  for (const row of rows) {
    configs[row.key] = row.value
  }
  return configs
}

export function deleteConfig(key: string): boolean {
  const stmt = db.prepare('DELETE FROM api_config WHERE key = ?')
  try {
    stmt.run(key)
    return true
  } catch (error) {
    console.error('Failed to delete config:', error)
    return false
  }
}

// 日志相关函数
export function addLog(taskType: string, status: string, result?: any, error?: string): void {
  const stmt = db.prepare(`
    INSERT INTO execution_log (task_type, status, result, error)
    VALUES (?, ?, ?, ?)
  `)
  stmt.run(taskType, status, result ? JSON.stringify(result) : null, error || null)
}

export function getRecentLogs(limit: number = 50): any[] {
  const stmt = db.prepare(`
    SELECT * FROM execution_log 
    ORDER BY created_at DESC 
    LIMIT ?
  `)
  return stmt.all(limit)
}

export default db