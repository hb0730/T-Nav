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
  for (const iconSet of ICON_SETS) {
    console.log(`Generating ${iconSet.name} icons...`)
    const iconPath = join(process.cwd(), 'node_modules', iconSet.path)
    const iconData: IconifyData = JSON.parse(readFileSync(iconPath, 'utf-8'))
    const prefix = `iconify-${iconData.prefix}`
    const data = Object.keys(iconData.icons).map(item => `${prefix}:${item}`)
    writeFileSync(
      join(process.cwd(), 'components', 'IconPicker', 'data', `icons.${iconSet.name}.ts`),
      `export default ${JSON.stringify({ name: `${iconSet.name} Icons`, prefix, data })}`,
    )
  }
  console.log('Done.')
}

// 直接执行
generateIcons()
