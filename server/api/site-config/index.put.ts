import type { ApiResponse, SiteConfig, UpdateSiteConfigDto } from '~/types/database'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event): Promise<ApiResponse<SiteConfig>> => {
  try {
    const body = await readBody<UpdateSiteConfigDto>(event)

    // 获取现有配置
    let siteConfig = await prisma.siteConfig.findFirst()

    if (!siteConfig) {
      // 如果不存在配置，先创建默认配置
      siteConfig = await prisma.siteConfig.create({
        data: {
          name: body.name || 'T-Nav 导航网站',
          description: body.description || '专门为开发者和技术爱好者设计的导航网站',
          keywords: body.keywords || 'T-Nav,导航网站,编程资源,开发者工具',
          author: body.author || 'hb0730',
          authorLink: body.authorLink || 'https://hb0730.me',
          url: body.url || 'https://t-nav.hb0730.me',
          logo: body.logo || 'https://t-nav.hb0730.me/logo.png',
          icon: body.icon || 'https://t-nav.hb0730.me/favicon.ico',
          icp: body.icp || '',
          defaultLocale: body.defaultLocale || 'zh-CN',
          env: body.env || 'production',
        },
      })
    }
    else {
      // 更新现有配置
      siteConfig = await prisma.siteConfig.update({
        where: { id: siteConfig.id },
        data: {
          ...body,
        },
      })
    }

    return {
      success: true,
      data: siteConfig,
    }
  }
  catch (error) {
    console.error('Error updating site config:', error)
    if (error.statusCode) {
      throw error
    }
    return {
      success: false,
      message: '更新站点配置失败',
    }
  }
})
