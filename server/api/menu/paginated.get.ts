import { prisma } from '~/server/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    // 分页参数
    const page = Number(query.page) || 1
    const pageSize = Number(query.pageSize) || 6
    const skip = (page - 1) * pageSize

    // 链接限制参数
    const linksPerCategory = Number(query.linksPerCategory) || 8
    const loadFullLinks = query.loadFullLinks === 'true'

    // 获取分类总数
    const totalCategories = await prisma.category.count({
      where: {
        links: {
          some: {
            deprecated: false,
          },
        },
      },
    })

    // 获取分页分类数据
    const categories = await prisma.category.findMany({
      where: {
        links: {
          some: {
            deprecated: false,
          },
        },
      },
      orderBy: { order: 'asc' },
      skip,
      take: pageSize,
      include: {
        links: {
          where: { deprecated: false },
          orderBy: { order: 'asc' },
          take: loadFullLinks ? undefined : linksPerCategory,
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

    // 构建菜单结构
    const menu = categories.map(category => ({
      id: category.id,
      title: category.title,
      icon: category.icon,
      totalLinks: category._count.links,
      hasMore: category._count.links > linksPerCategory && !loadFullLinks,
      children: category.links.map(link => ({
        title: link.title,
        url: link.url,
        logo: link.logo,
        description: link.description,
        tags: link.tags ? JSON.parse(link.tags) : [],
        deprecated: link.deprecated,
      })),
    }))

    const totalPages = Math.ceil(totalCategories / pageSize)
    const hasNextPage = page < totalPages

    return {
      success: true,
      data: {
        categories: menu,
        pagination: {
          page,
          pageSize,
          total: totalCategories,
          totalPages,
          hasNextPage,
          hasPrevPage: page > 1,
        },
      },
    }
  }
  catch (error) {
    console.error('获取分页菜单数据失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取菜单数据失败',
    })
  }
})
