import { prisma } from '~/server/prisma'

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const limit = Number.parseInt(query.limit as string) || 3 // 默认加载前3个分类的完整数据

    // 获取分类列表（用于导航）
    const allCategories = await prisma.category.findMany({
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

    // 获取前几个分类的完整数据
    const categoriesWithLinks = await prisma.category.findMany({
      where: {
        links: {
          some: {
            deprecated: false,
          },
        },
      },
      orderBy: { order: 'asc' },
      take: limit,
      include: {
        links: {
          where: { deprecated: false },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            links: {
              where: { deprecated: false },
            },
          },
        },
      },
    })

    // 构建返回数据
    const categoriesData = categoriesWithLinks.map(category => ({
      id: category.id,
      title: category.title,
      icon: category.icon,
      totalLinks: category._count.links,
      links: category.links.map(link => ({
        title: link.title,
        url: link.url,
        logo: link.logo,
        description: link.description,
        tags: link.tags ? JSON.parse(link.tags) : [],
        deprecated: link.deprecated,
      })),
    }))

    // 简化的导航菜单
    const navigationMenu = allCategories.map(category => ({
      title: category.title,
      icon: category.icon,
      linksCount: category._count.links,
    }))

    return {
      success: true,
      data: {
        categories: categoriesData,
        navigationMenu,
        totalCategories: allCategories.length,
      },
    }
  }
  catch (error) {
    console.error('获取首页分类数据失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取首页数据失败',
    })
  }
})
