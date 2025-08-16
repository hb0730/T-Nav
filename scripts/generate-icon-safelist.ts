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

function generate() {
  const icons: string[] = []
  for (const iconSet of ICON_SETS) {
    const iconPath = join(process.cwd(), 'node_modules', iconSet.path)
    const iconData: IconifyData = JSON.parse(readFileSync(iconPath, 'utf-8'))
    for (const iconName of Object.keys(iconData.icons)) {
      icons.push(`i-${iconData.prefix}-${iconName}`)
    }
  }

  writeFileSync(join(process.cwd(), 'lib', 'icons-safelist.ts'), `export const iconSafelist = ${JSON.stringify(icons)}`)

  console.log('Done.')
}

generate()
