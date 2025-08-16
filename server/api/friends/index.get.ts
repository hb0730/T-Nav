import { prisma } from '~/server/prisma'

export default defineEventHandler(async (event) => {
  try {
    const friendLinks = await prisma.friendLink.findMany({
      orderBy: {
        order: 'asc',
      },
    })

    return {
      success: true,
      data: friendLinks,
    }
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '获取友情链接失败',
    })
  }
})
