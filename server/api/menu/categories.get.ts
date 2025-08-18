import { prisma } from '~/server/prisma'

export default defineEventHandler(async (event) => {
  try {
    // 只获取有链接的分类基本信息，用于导航菜单
    const categories = await prisma.category.findMany({
      where: {
        links: {
          some: {
            deprecated: false,
          },
        },
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        icon: true,
        _count: {
          select: {
            links: {
              where: { deprecated: false },
            },
          },
        },
      },
    })

    // 构建简化的菜单结构
    const menu = categories.map(category => ({
      title: category.title,
      icon: category.icon,
      linksCount: category._count.links,
    }))

    return {
      success: true,
      data: menu,
    }
  }
  catch (error) {
    console.error('获取分类菜单失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取菜单数据失败',
    })
  }
})
