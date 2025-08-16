import type { Category, Link } from '~/types/database'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'

const DATA_DIR = join(process.cwd(), 'server/data')
const CATEGORIES_FILE = join(DATA_DIR, 'categories.json')
const LINKS_FILE = join(DATA_DIR, 'links.json')

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  }
  catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// 确保文件存在
async function ensureFile(filePath: string, defaultData: any) {
  try {
    await fs.access(filePath)
  }
  catch {
    await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2))
  }
}

export class Storage {
  static async getCategories(): Promise<Category[]> {
    await ensureDataDir()
    await ensureFile(CATEGORIES_FILE, [])

    const data = await fs.readFile(CATEGORIES_FILE, 'utf-8')
    return JSON.parse(data)
  }

  static async saveCategories(categories: Category[]): Promise<void> {
    await ensureDataDir()
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2))
  }

  static async getLinks(): Promise<Link[]> {
    await ensureDataDir()
    await ensureFile(LINKS_FILE, [])

    const data = await fs.readFile(LINKS_FILE, 'utf-8')
    return JSON.parse(data)
  }

  static async saveLinks(links: Link[]): Promise<void> {
    await ensureDataDir()
    await fs.writeFile(LINKS_FILE, JSON.stringify(links, null, 2))
  }
}
