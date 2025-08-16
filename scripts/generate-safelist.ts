#!/usr/bin/env tsx

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ALL_ICONS } from '../lib/icons-data'

function generateSafelist() {
  const iconClasses = ALL_ICONS.map(icon => icon.className)

  // 限制数量，避免生成过大的配置文件
  const limitedClasses = iconClasses.slice(0, 500) // 只包含前500个最常用的

  const content = `// 自动生成的UnoCSS安全列表
// 生成时间: ${new Date().toISOString()}
// 包含图标数量: ${limitedClasses.length}

export const iconSafelist = [
${limitedClasses.map(className => `  '${className}',`).join('\n')}
]
`

  const outputPath = join(process.cwd(), 'lib/icon-safelist.ts')
  writeFileSync(outputPath, content, 'utf-8')

  console.log(`✅ UnoCSS安全列表生成完成!`)
  console.log(`📄 输出文件: ${outputPath}`)
  console.log(`🔢 包含图标数量: ${limitedClasses.length}`)
}

// 直接执行
generateSafelist()
