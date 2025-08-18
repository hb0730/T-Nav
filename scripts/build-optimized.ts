#!/usr/bin/env tsx

/**
 * 优化的构建脚本
 * 包含构建前清理、构建分析、构建后优化等步骤
 */

import { execSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

// 构建前清理
function cleanBuild() {
  console.log('🧹 清理构建缓存...')

  const cleanPaths = [
    '.nuxt',
    '.output',
    'dist',
    'node_modules/.cache/nuxt',
    'node_modules/.vite',
  ]

  cleanPaths.forEach((path) => {
    const fullPath = resolve(path)
    if (existsSync(fullPath)) {
      rmSync(fullPath, { recursive: true, force: true })
      console.log(`   删除: ${path}`)
    }
  })
}

// 构建分析
function analyzeBuild() {
  console.log('📊 分析构建产物...')

  const outputPath = resolve('.output')
  if (existsSync(outputPath)) {
    console.log(`   构建产物大小: ${(getDirectorySize(outputPath) / 1024 / 1024).toFixed(2)} MB`)
  }
}

// 获取目录大小
function getDirectorySize(dirPath: string): number {
  let size = 0
  try {
    const fs = require('node:fs')
    const path = require('node:path')

    const files = fs.readdirSync(dirPath)
    files.forEach((file: string) => {
      const filePath = path.join(dirPath, file)
      const stats = fs.statSync(filePath)

      if (stats.isDirectory()) {
        size += getDirectorySize(filePath)
      }
      else {
        size += stats.size
      }
    })
  }
  catch (error) {
    console.warn(`无法计算目录大小: ${dirPath}`)
  }

  return size
}

// 主构建函数
async function build() {
  console.log('🚀 开始优化构建...\n')

  try {
    // 1. 清理
    cleanBuild()

    // 2. 安装依赖（确保最新）
    console.log('📦 检查依赖...')
    execSync('pnpm install --frozen-lockfile', { stdio: 'inherit' })

    // 3. 生成类型
    console.log('🏗️  生成类型定义...')
    execSync('pnpm run db:generate', { stdio: 'inherit' })

    // 4. 生成图标
    console.log('🎨 生成图标...')
    execSync('pnpm run icons:generate', { stdio: 'inherit' })

    // 5. 构建
    console.log('🔨 构建应用...')
    const startTime = Date.now()
    execSync('pnpm run build', { stdio: 'inherit' })
    const buildTime = Date.now() - startTime

    // 6. 分析构建结果
    analyzeBuild()

    console.log(`\n✅ 构建完成! 耗时: ${(buildTime / 1000).toFixed(2)}s`)
    console.log('💡 使用 `pnpm preview` 预览构建结果')
  }
  catch (error) {
    console.error('❌ 构建失败:', error)
    process.exit(1)
  }
}

// 执行构建
if (import.meta.url === `file://${process.argv[1]}`) {
  build()
}

export { analyzeBuild, build, cleanBuild }
