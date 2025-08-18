import { prisma } from '~/server/prisma'

export default defineEventHandler(async (event) => {
  try {
    const categoryId = getRouterParam(event, 'id')

    if (!categoryId) {
      throw createError({
        statusCode: 400,
        statusMessage: '分类ID不能为空',
      })
    }

    const query = getQuery(event)
    const page = Number(query.page) || 1
    const pageSize = Number(query.pageSize) || 20
    const skip = (page - 1) * pageSize

    // 获取分类信息
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
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

    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: '分类不存在',
      })
    }

    // 获取分页链接
    const links = await prisma.link.findMany({
      where: {
        categoryId,
        deprecated: false,
      },
      orderBy: { order: 'asc' },
      skip,
      take: pageSize,
    })

    const totalLinks = category._count.links
    const totalPages = Math.ceil(totalLinks / pageSize)
    const hasNextPage = page < totalPages

    return {
      success: true,
      data: {
        category: {
          id: category.id,
          title: category.title,
          icon: category.icon,
          totalLinks,
        },
        links: links.map(link => ({
          title: link.title,
          url: link.url,
          logo: link.logo,
          description: link.description,
          tags: link.tags ? JSON.parse(link.tags) : [],
          deprecated: link.deprecated,
        })),
        pagination: {
          page,
          pageSize,
          total: totalLinks,
          totalPages,
          hasNextPage,
          hasPrevPage: page > 1,
        },
      },
    }
  }
  catch (error) {
    console.error('获取分类链接失败:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '获取分类链接失败',
    })
  }
})
