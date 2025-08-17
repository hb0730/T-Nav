#!/usr/bin/env tsx

/**
 * Bundle 分析脚本
 * 分析构建产物，找出可优化的地方
 */

import { execSync } from 'node:child_process'
import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface BundleAnalysis {
  totalSize: number
  gzipSize: number
  largestChunks: Array<{ name: string; size: number; gzipSize: number }>
  recommendations: string[]
}

// 分析bundle
function analyzeBundle(): BundleAnalysis {
  const clientDir = resolve('.output/public/_nuxt')
  const recommendations: string[] = []
  let totalSize = 0
  const largestChunks: Array<{ name: string; size: number; gzipSize: number }> = []

  if (!existsSync(clientDir)) {
    console.warn('⚠️  构建产物不存在，请先运行构建')
    return { totalSize: 0, gzipSize: 0, largestChunks: [], recommendations }
  }

  try {
    // 执行构建分析
    console.log('🔍 分析 JavaScript bundles...')
    execSync('du -sh .output/public/_nuxt/*.js', { stdio: 'pipe' })
    
    // 分析大文件
    const files = readdirSync(clientDir)
    const jsFiles = files.filter((file: string) => file.endsWith('.js'))
    
    jsFiles.forEach((file: string) => {
      const filePath = resolve(clientDir, file)
      const stats = statSync(filePath)
      const sizeKB = stats.size / 1024
      
      totalSize += stats.size
      
      if (sizeKB > 100) {
        largestChunks.push({
          name: file,
          size: sizeKB,
          gzipSize: sizeKB * 0.3, // 估算gzip压缩率
        })
      }
    })

    // 排序最大的chunks
    largestChunks.sort((a, b) => b.size - a.size)
    largestChunks.splice(10) // 只保留前10个

    // 生成建议
    if (largestChunks.length > 0) {
      recommendations.push('考虑代码分割大的chunk文件')
    }
    
    if (totalSize > 2 * 1024 * 1024) {
      recommendations.push('总bundle大小超过2MB，考虑懒加载非关键代码')
    }

    largestChunks.forEach(chunk => {
      if (chunk.size > 500) {
        recommendations.push(`${chunk.name} 超过500KB，检查是否包含不必要的依赖`)
      }
    })

  } catch (error) {
    console.warn('分析过程中出现错误:', error)
  }

  const finalGzipSize = totalSize * 0.3 / 1024 / 1024 // 估算gzip后大小
  
  return {
    totalSize: totalSize / 1024 / 1024, // MB
    gzipSize: finalGzipSize,
    largestChunks,
    recommendations,
  }
}

// 显示分析结果
function displayAnalysis(analysis: BundleAnalysis) {
  console.log('\n📊 Bundle 分析结果:')
  console.log(`   总大小: ${analysis.totalSize.toFixed(2)} MB`)
  console.log(`   Gzip后: ${analysis.gzipSize.toFixed(2)} MB`)
  
  if (analysis.largestChunks.length > 0) {
    console.log('\n🏋️  最大的文件:')
    analysis.largestChunks.forEach((chunk, index) => {
      console.log(`   ${index + 1}. ${chunk.name}: ${chunk.size.toFixed(1)} KB`)
    })
  }

  if (analysis.recommendations.length > 0) {
    console.log('\n💡 优化建议:')
    analysis.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`)
    })
  }
}

// 生成详细报告
function generateReport(analysis: BundleAnalysis) {
  const report = {
    timestamp: new Date().toISOString(),
    analysis,
    buildSize: analysis.totalSize,
    gzipSize: analysis.gzipSize,
    performance: {
      score: calculatePerformanceScore(analysis),
      suggestions: analysis.recommendations,
    },
  }

  writeFileSync(
    resolve('bundle-analysis.json'),
    JSON.stringify(report, null, 2)
  )
  
  console.log('\n📝 详细报告已保存到 bundle-analysis.json')
}

// 计算性能分数
function calculatePerformanceScore(analysis: BundleAnalysis): number {
  let score = 100
  
  // 总大小影响
  if (analysis.totalSize > 3) score -= 30
  else if (analysis.totalSize > 2) score -= 20
  else if (analysis.totalSize > 1) score -= 10
  
  // 大文件影响
  analysis.largestChunks.forEach(chunk => {
    if (chunk.size > 1000) score -= 20
    else if (chunk.size > 500) score -= 10
    else if (chunk.size > 200) score -= 5
  })
  
  return Math.max(0, score)
}

// 主函数
async function main() {
  console.log('🚀 开始Bundle分析...\n')
  
  const analysis = analyzeBundle()
  displayAnalysis(analysis)
  generateReport(analysis)
  
  const score = calculatePerformanceScore(analysis)
  console.log(`\n🎯 性能评分: ${score}/100`)
  
  if (score >= 80) {
    console.log('✅ Bundle优化良好!')
  } else if (score >= 60) {
    console.log('⚠️  Bundle有优化空间')
  } else {
    console.log('❌ Bundle需要重点优化')
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { analyzeBundle, displayAnalysis, generateReport }