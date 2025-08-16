#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface IconData {
  body: string
  width?: number
  height?: number
  hidden?: boolean
}

interface IconifyData {
  prefix: string
  icons: Record<string, IconData>
}

interface GeneratedIcon {
  name: string
  className: string
  prefix: string
  category: string
}

const ICON_SETS = [
  {
    name: 'tabler',
    path: '@iconify-json/tabler/icons.json',
    category: 'General',
  },
  {
    name: 'logos',
    path: '@iconify-json/logos/icons.json',
    category: 'Brands',
  },
]

const ITEMS_PER_PAGE = 120 // 每页显示的图标数量

function generateIcons() {
  const allIcons: GeneratedIcon[] = []

  for (const iconSet of ICON_SETS) {
    console.log(`Processing ${iconSet.name}...`)

    try {
      const iconPath = join(process.cwd(), 'node_modules', iconSet.path)
      const iconData: IconifyData = JSON.parse(readFileSync(iconPath, 'utf-8'))

      const icons = Object.keys(iconData.icons)
        .filter(name => !iconData.icons[name]?.hidden) // 过滤隐藏的图标
        .map(name => ({
          name,
          className: `i-${iconData.prefix}-${name}`,
          prefix: iconData.prefix,
          category: iconSet.category,
        }))

      allIcons.push(...icons)
      console.log(`Added ${icons.length} icons from ${iconSet.name}`)
    }
    catch (error) {
      console.error(`Error processing ${iconSet.name}:`, error)
    }
  }

  // 按名称排序
  allIcons.sort((a, b) => a.name.localeCompare(b.name))

  // 生成TypeScript内容
  const content = `// 自动生成的图标数据文件
// 生成时间: ${new Date().toISOString()}
// 总图标数量: ${allIcons.length}

export interface IconInfo {
  name: string
  className: string
  prefix: string
  category: string
}

export const ITEMS_PER_PAGE = ${ITEMS_PER_PAGE}

export const ALL_ICONS: IconInfo[] = ${JSON.stringify(allIcons, null, 2)}

// 按前缀分组的图标
export const ICONS_BY_PREFIX = {
  ${ICON_SETS.map(set => `${set.name}: ALL_ICONS.filter(icon => icon.prefix === '${set.name}')`).join(',\n  ')}
} as const

// 按分类分组的图标
export const ICONS_BY_CATEGORY = {
  ${[...new Set(ICON_SETS.map(set => set.category))].map(category =>
    `'${category}': ALL_ICONS.filter(icon => icon.category === '${category}')`,
  ).join(',\n  ')}
} as const

// 获取分页数据
export function getIconsPage(icons: IconInfo[], page: number): IconInfo[] {
  const startIndex = (page - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  return icons.slice(startIndex, endIndex)
}

// 获取总页数
export function getTotalPages(icons: IconInfo[]): number {
  return Math.ceil(icons.length / ITEMS_PER_PAGE)
}

// 搜索图标
export function searchIcons(icons: IconInfo[], query: string): IconInfo[] {
  if (!query.trim()) return icons
  
  const searchTerm = query.toLowerCase()
  return icons.filter(icon => 
    icon.name.toLowerCase().includes(searchTerm) ||
    icon.className.toLowerCase().includes(searchTerm)
  )
}

// 常用图标预设 (从原组件中提取)
export const PRESET_ICONS = [
  // 技术类
  { name: 'AI', value: 'i-tabler-robot', category: '技术' },
  { name: '代码', value: 'i-tabler-code', category: '技术' },
  { name: '终端', value: 'i-tabler-terminal', category: '技术' },
  { name: 'API', value: 'i-tabler-api', category: '技术' },
  { name: 'Github', value: 'i-tabler-brand-github', category: '技术' },
  { name: '数据库', value: 'i-tabler-database', category: '技术' },
  { name: '服务器', value: 'i-tabler-server', category: '技术' },
  { name: '云', value: 'i-tabler-cloud', category: '技术' },
  
  // 前端相关
  { name: '布局', value: 'i-tabler-layout-grid-filled', category: '前端' },
  { name: '组件', value: 'i-tabler-components', category: '前端' },
  { name: '画板', value: 'i-tabler-palette', category: '前端' },
  { name: '画笔', value: 'i-tabler-brush', category: '前端' },
  { name: 'CSS', value: 'i-tabler-file-code', category: '前端' },
  { name: '响应式', value: 'i-tabler-device-mobile', category: '前端' },
  
  // Vue生态
  { name: 'Vue', value: 'i-logos-vue', category: '框架' },
  { name: 'Nuxt', value: 'i-logos-nuxt-icon', category: '框架' },
  { name: 'Vite', value: 'i-logos-vitejs', category: '框架' },
  
  // React生态
  { name: 'React', value: 'i-logos-react', category: '框架' },
  { name: 'Next.js', value: 'i-logos-nextjs-icon', category: '框架' },
  
  // 工具类
  { name: '工具', value: 'i-tabler-tool', category: '工具' },
  { name: '设置', value: 'i-tabler-settings', category: '工具' },
  { name: '扳手', value: 'i-tabler-wrench', category: '工具' },
  { name: '齿轮', value: 'i-tabler-adjustments', category: '工具' },
  { name: '魔法棒', value: 'i-tabler-wand', category: '工具' },
  
  // 后端相关
  { name: '后端', value: 'i-tabler-server-2', category: '后端' },
  { name: 'Node.js', value: 'i-logos-nodejs-icon', category: '后端' },
  { name: 'Docker', value: 'i-logos-docker-icon', category: '后端' },
  { name: 'API接口', value: 'i-tabler-plug', category: '后端' },
  
  // 媒体类
  { name: '图片', value: 'i-tabler-photo', category: '媒体' },
  { name: '视频', value: 'i-tabler-video', category: '媒体' },
  { name: '音乐', value: 'i-tabler-music', category: '媒体' },
  { name: '文件', value: 'i-tabler-file', category: '媒体' },
  
  // 常用图标
  { name: '首页', value: 'i-tabler-home', category: '常用' },
  { name: '用户', value: 'i-tabler-user', category: '常用' },
  { name: '心形', value: 'i-tabler-heart', category: '常用' },
  { name: '星星', value: 'i-tabler-star', category: '常用' },
  { name: '书签', value: 'i-tabler-bookmark', category: '常用' },
  { name: '链接', value: 'i-tabler-link', category: '常用' },
] as const
`

  // 写入文件
  const outputPath = join(process.cwd(), 'lib/icons-data.ts')
  writeFileSync(outputPath, content, 'utf-8')

  console.log(`\n✅ 图标数据生成完成!`)
  console.log(`📄 输出文件: ${outputPath}`)
  console.log(`🔢 总图标数量: ${allIcons.length}`)
  console.log(`📄 每页图标数量: ${ITEMS_PER_PAGE}`)
  console.log(`📖 总页数: ${Math.ceil(allIcons.length / ITEMS_PER_PAGE)}`)

  // 按前缀统计
  const stats = ICON_SETS.reduce((acc, set) => {
    acc[set.name] = allIcons.filter(icon => icon.prefix === set.name).length
    return acc
  }, {} as Record<string, number>)

  console.log('\n📊 图标统计:')
  Object.entries(stats).forEach(([prefix, count]) => {
    console.log(`  ${prefix}: ${count} 个图标`)
  })
}

// 直接执行
generateIcons()
