import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    // 获取站点配置
    const siteConfig = await prisma.siteConfig.findFirst()
    if (!siteConfig) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Site config not found',
      })
    }

    // 获取所有分类用于生成sitemap
    const categories = await prisma.category.findMany({
      select: {
        title: true,
        updatedAt: true,
      },
    })

    const baseUrl = siteConfig.url
    const currentDate = new Date().toISOString()

    // 生成sitemap XML
    const urls = [
      // 首页
      {
        loc: baseUrl,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '1.0',
      },
      // 分类页面（通过锚点）
      ...categories.map((category: { title: string, updatedAt: Date }) => ({
        loc: `${baseUrl}#${encodeURIComponent(category.title)}`,
        lastmod: category.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: '0.8',
      })),
      // 友情链接页面
      {
        loc: `${baseUrl}/links`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.6',
      },
    ]

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    // 设置正确的Content-Type
    setHeader(event, 'Content-Type', 'application/xml')
    setHeader(event, 'Cache-Control', 'public, max-age=3600') // 缓存1小时

    return sitemap
  }
  catch (error) {
    console.error('Error generating sitemap:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})
