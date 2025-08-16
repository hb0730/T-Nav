import { prisma } from '~/server/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: '分类ID不能为空',
      })
    }

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      throw createError({
        statusCode: 404,
        statusMessage: '分类不存在',
      })
    }

    // 检查是否有链接使用此分类
    const linkCount = await prisma.link.count({
      where: { categoryId: id },
    })

    if (linkCount > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '该分类下还有链接，无法删除',
      })
    }

    await prisma.category.delete({
      where: { id },
    })

    return {
      success: true,
      message: '分类删除成功',
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '删除分类失败',
    })
  }
})
