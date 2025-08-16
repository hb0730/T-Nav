import type { Category, Link } from '../types/database'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'

// 手动导入数据以避免图片导入问题
const menuDataList = [
  {
    title: 'AI',
    icon: '/assets/imgs/ai/ai-logo.png',
    children: [
      {
        title: 'DeepSeek',
        logo: 'https://www.deepseek.com/favicon.ico',
        url: 'https://www.deepseek.com/',
        description: '深度求索（DeepSeek），成立于2023年，专注于研究世界领先的通用人工智能底层模型与技术',
        tags: ['chat', 'ai', '人工智能', 'deepseek'],
      },
      {
        title: 'Kimi',
        logo: 'https://statics.moonshot.cn/kimi-chat/favicon.ico',
        url: 'https://kimi.moonshot.cn',
        description: 'Kimi 是一个有着超大"内存"的智能助手',
        tags: ['chat', 'ai', '人工智能', 'chatgpt'],
      },
    ],
  },
  {
    title: '前端',
    icon: 'i-tabler-layout-grid-filled',
    children: [],
  },
  {
    title: 'Vue',
    icon: 'i-logos-vue',
    children: [],
  },
]

const linksData = [
  {
    title: 'hb0730',
    url: 'https://hb0730.me',
    logo: 'https://cravatar.cn/avatar/8b21c82521c08425c4426b156ff80623?size=256',
    description: 'hb0730的个人网站',
  },
]

const DATA_DIR = join(process.cwd(), 'server/data')

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  }
  catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

async function migrateData() {
  await ensureDataDir()

  // 迁移分类数据
  const categories: Category[] = menuDataList.map((item, index) => ({
    id: `cat_${Date.now()}_${index}`,
    title: item.title,
    icon: item.icon,
    order: index,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  // 迁移链接数据
  const links: Link[] = []
  let linkOrder = 0

  menuDataList.forEach((category) => {
    const categoryId = categories.find(cat => cat.title === category.title)?.id
    if (!categoryId)
      return

    if (category.children) {
      category.children.forEach((child) => {
        links.push({
          id: `link_${Date.now()}_${linkOrder}`,
          title: child.title,
          url: child.url || '',
          logo: child.logo,
          description: child.description,
          tags: child.tags || [],
          categoryId,
          order: linkOrder,
          deprecated: child.deprecated || false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        linkOrder++
      })
    }
  })

  // 写入文件
  await fs.writeFile(
    join(DATA_DIR, 'categories.json'),
    JSON.stringify(categories, null, 2),
  )

  await fs.writeFile(
    join(DATA_DIR, 'links.json'),
    JSON.stringify(links, null, 2),
  )

  console.log(`✅ 数据迁移完成!`)
  console.log(`📁 分类数量: ${categories.length}`)
  console.log(`🔗 链接数量: ${links.length}`)
  console.log(`📂 数据存储位置: ${DATA_DIR}`)
}

// 运行迁移
migrateData().catch(console.error)
