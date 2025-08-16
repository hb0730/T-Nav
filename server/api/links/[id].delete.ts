import { prisma } from '~/server/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: '链接ID不能为空',
      })
    }

    // 查找要删除的链接
    const existingLink = await prisma.link.findUnique({
      where: { id },
    })

    if (!existingLink) {
      throw createError({
        statusCode: 404,
        statusMessage: '链接不存在',
      })
    }

    // 删除链接
    await prisma.link.delete({
      where: { id },
    })

    return {
      success: true,
      message: '链接删除成功',
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '删除链接失败',
    })
  }
})
