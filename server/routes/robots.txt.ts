import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    // 获取站点配置
    const siteConfig = await prisma.siteConfig.findFirst()

    const baseUrl = siteConfig?.url || 'https://t-nav.hb0730.me'

    const robotsContent = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /login

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml`

    // 设置正确的Content-Type
    setHeader(event, 'Content-Type', 'text/plain')
    setHeader(event, 'Cache-Control', 'public, max-age=86400') // 缓存24小时

    return robotsContent
  }
  catch (error) {
    console.error('Error generating robots.txt:', error)
    // 即使出错也返回基本的robots.txt
    return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /login

# Sitemap
Sitemap: https://t-nav.hb0730.me/sitemap.xml`
  }
})
