import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const categoryId = query.categoryId as string

    const whereClause = categoryId ? { categoryId } : {}

    const links = await prisma.link.findMany({
      where: whereClause,
      orderBy: { order: 'asc' },
    })

    // 将序列化的tags字段转换为数组
    const formattedLinks = links.map(link => ({
      ...link,
      tags: typeof link.tags === 'string' ? JSON.parse(link.tags) : link.tags,
    }))

    return {
      success: true,
      data: formattedLinks,
    }
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '获取链接失败',
    })
  }
})
