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

function generateIcons() {
  // 读取 JSON 文件 IconPicker/data/icons.[tabler|logos].ts
  // 结构 export default {
  //   name: 'Tabler Icons',
  // .  data:[
  //     'i-tabler-robot'
  // ]
  // }

  for (const iconSet of ICON_SETS) {
    console.log(`Generating ${iconSet.name} icons...`)
    const iconPath = join(process.cwd(), 'node_modules', iconSet.path)
    const iconData: IconifyData = JSON.parse(readFileSync(iconPath, 'utf-8'))
    const iconNames = Object.keys(iconData.icons)
    const iconFile = join(process.cwd(), 'components', 'IconPicker', 'data', `icons.${iconSet.name}.ts`)
    const iconFileContent = `export default {name: '${iconSet.name} Icons',prefix: '${iconData.prefix}',data: [${iconNames.map(iconName => `'i-${iconData.prefix}-${iconName}'`).join(',')}],}`
    writeFileSync(iconFile, iconFileContent)
  }
  console.log('Done.')
}

// 直接执行
generateIcons()
