import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    })

    return {
      success: true,
      data: categories,
    }
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '获取分类失败',
    })
  }
})
