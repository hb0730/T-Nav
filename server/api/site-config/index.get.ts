import type { ApiResponse, SiteConfig } from '~/types/database'
import { prisma } from '~/server/prisma'

export default defineEventHandler(async (): Promise<ApiResponse<SiteConfig>> => {
  try {
    // 获取站点配置，如果不存在则创建默认配置
    let siteConfig = await prisma.siteConfig.findFirst()

    if (!siteConfig) {
      // 创建默认配置
      siteConfig = await prisma.siteConfig.create({
        data: {
          name: 'T-Nav 导航网站',
          description: '"T-Nav" 是一个专门为开发者和技术爱好者设计的导航网站。它提供了一站式的解决方案，包括编程学习资源、开发工具、开源项目以及最新的技术动态。无论你是初学者，还是经验丰富的开发者，"T-Nav" 都能帮助你快速找到所需的资源，提升你的开发效率和学习效果。我们的目标是让技术更加触手可及，让每一个用户都能在 "T-Nav" 找到属于自己的技术之路。',
          keywords: 'T-Nav,导航网站,编程资源,开发者工具,在线学习,编程教程,开源项目,技术新闻,技术社区,开发者社区,编程语言,前端开发,后端开发,全栈开发,JavaScript,Python,Java,C++,Ruby,Go,PHP,Swift,Kotlin,Rust,TypeScript,Vue,React,Angular,Django,Flask,Spring,Laravel,Ruby on Rails,Node.js,Docker,Kubernetes,DevOps,云计算,大数据,人工智能,机器学习,深度学习,数据科学,网络安全,区块链',
          author: 'hb0730',
          authorLink: 'https://hb0730.me',
          url: 'https://t-nav.hb0730.me',
          logo: 'https://t-nav.hb0730.me/logo.png',
          icon: 'https://t-nav.hb0730.me/favicon.ico',
          icp: '',
          defaultLocale: 'zh-CN',
          env: 'production',
        },
      })
    }

    return {
      success: true,
      data: siteConfig,
    }
  }
  catch (error) {
    console.error('Error fetching site config:', error)
    return {
      success: false,
      message: '获取站点配置失败',
    }
  }
})
