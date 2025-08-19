import { prisma } from '~/server/prisma'

export default defineEventHandler(async (event) => {
  try {
    const categoryTitle = getRouterParam(event, 'title')
    const query = getQuery(event)

    if (!categoryTitle) {
      throw createError({
        statusCode: 400,
        statusMessage: '分类标题参数缺失',
      })
    }

    // 解码URL参数
    const decodedTitle = decodeURIComponent(categoryTitle)

    // 分页参数
    const page = Number.parseInt(query.page as string) || 1
    const pageSize = Number.parseInt(query.pageSize as string) || 50 // 每页50个
    const skip = (page - 1) * pageSize

    // 获取分类基本信息
    const category = await prisma.category.findFirst({
      where: {
        title: decodedTitle,
        links: {
          some: {
            deprecated: false,
          },
        },
      },
      select: {
        id: true,
        title: true,
        icon: true,
        description: true,
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

    // 获取分页链接数据
    const links = await prisma.link.findMany({
      where: {
        categoryId: category.id,
        deprecated: false,
      },
      orderBy: { order: 'asc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        url: true,
        logo: true,
        description: true,
        tags: true,
        deprecated: true,
      },
    })

    const totalLinks = category._count.links
    const totalPages = Math.ceil(totalLinks / pageSize)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // 构建返回数据
    const result = {
      category: {
        id: category.id,
        title: category.title,
        icon: category.icon,
        description: category.description,
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
        totalLinks,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    }

    return {
      success: true,
      data: result,
    }
  }
  catch (error) {
    console.error('获取分类分页数据失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取分类数据失败',
    })
  }
})
