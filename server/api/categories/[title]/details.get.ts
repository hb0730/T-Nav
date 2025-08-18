import { prisma } from '~/server/prisma'

export default defineEventHandler(async (event) => {
  try {
    const categoryTitle = getRouterParam(event, 'title')

    if (!categoryTitle) {
      throw createError({
        statusCode: 400,
        statusMessage: '分类标题参数缺失',
      })
    }

    // 解码URL参数
    const decodedTitle = decodeURIComponent(categoryTitle)

    // 获取分类详细信息
    const category = await prisma.category.findFirst({
      where: {
        title: decodedTitle,
        links: {
          some: {
            deprecated: false,
          },
        },
      },
      include: {
        links: {
          where: { deprecated: false },
          orderBy: { order: 'asc' },
          // 不限制数量，返回所有链接（用于详情页面）
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

    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: '分类不存在',
      })
    }

    // 构建分类数据
    const categoryData = {
      id: category.id,
      title: category.title,
      icon: category.icon,
      description: category.description,
      totalLinks: category._count.links,
      links: category.links.map(link => ({
        title: link.title,
        url: link.url,
        logo: link.logo,
        description: link.description,
        tags: link.tags ? JSON.parse(link.tags) : [],
        deprecated: link.deprecated,
      })),
    }

    return {
      success: true,
      data: categoryData,
    }
  }
  catch (error) {
    console.error('获取分类详情失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取分类详情失败',
    })
  }
})
