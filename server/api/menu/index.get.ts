import { prisma } from '~/server/prisma'

export default defineEventHandler(async (event) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        links: {
          where: { deprecated: false },
          orderBy: { order: 'asc' },
        },
      },
    })

    // 构建菜单结构
    const menu = categories
      .filter(category => category.links.length > 0) // 只返回有链接的分类
      .map(category => ({
        title: category.title,
        icon: category.icon,
        children: category.links.map(link => ({
          title: link.title,
          url: link.url,
          logo: link.logo,
          description: link.description,
          tags: link.tags ? JSON.parse(link.tags) : [],
        })),
      }))

    return {
      success: true,
      data: menu,
    }
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '获取菜单数据失败',
    })
  }
})
