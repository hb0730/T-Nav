import { prisma } from '~/server/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    
    const searchQuery = String(query.q || '').trim()
    const page = Number(query.page) || 1
    const pageSize = Math.min(Number(query.pageSize) || 20, 50) // 限制最大页面大小
    const skip = (page - 1) * pageSize
    
    // 如果没有搜索查询，返回空结果
    if (!searchQuery) {
      return {
        success: true,
        data: {
          results: [],
          pagination: {
            page,
            pageSize,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      }
    }

    // 构建搜索条件 - SQLite不支持insensitive模式
    const searchConditions = {
      OR: [
        // 标题搜索
        {
          title: {
            contains: searchQuery,
          },
        },
        // 描述搜索
        {
          description: {
            contains: searchQuery,
          },
        },
        // URL搜索（可能包含有用的关键词）
        {
          url: {
            contains: searchQuery,
          },
        },
        // 标签搜索 - 使用JSON字符串搜索
        {
          tags: {
            contains: searchQuery,
          },
        },
      ],
      // 排除已废弃的链接
      deprecated: false,
    }

    // 同时获取总数和分页结果
    const [total, links] = await Promise.all([
      prisma.link.count({
        where: searchConditions,
      }),
      prisma.link.findMany({
        where: searchConditions,
        include: {
          category: {
            select: {
              id: true,
              title: true,
              icon: true,
            },
          },
        },
        orderBy: [
          // 按创建时间排序，最新的在前
          {
            createdAt: 'desc',
          },
          // 然后按标题排序
          {
            title: 'asc',
          },
        ],
        skip,
        take: pageSize,
      }),
    ])

    // 格式化结果
    const results = links.map(link => ({
      id: link.id,
      title: link.title,
      url: link.url,
      logo: link.logo,
      description: link.description,
      tags: link.tags ? JSON.parse(link.tags) : [],
      category: (link as any).category ? {
        id: (link as any).category.id,
        title: (link as any).category.title,
        icon: (link as any).category.icon,
      } : null,
      deprecated: link.deprecated,
    }))

    const totalPages = Math.ceil(total / pageSize)
    const hasNextPage = page < totalPages

    return {
      success: true,
      data: {
        results,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage: page > 1,
        },
        query: searchQuery,
      },
    }
  }
  catch (error) {
    console.error('搜索失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '搜索服务暂时不可用',
    })
  }
})