import { prisma } from '~/server/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少友情链接ID',
      })
    }

    // 检查友情链接是否存在
    const existingFriendLink = await prisma.friendLink.findUnique({
      where: { id },
    })

    if (!existingFriendLink) {
      throw createError({
        statusCode: 404,
        statusMessage: '友情链接不存在',
      })
    }

    await prisma.friendLink.delete({
      where: { id },
    })

    return {
      success: true,
      message: '友情链接删除成功',
    }
  }
  catch (error) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '删除友情链接失败',
    })
  }
})
