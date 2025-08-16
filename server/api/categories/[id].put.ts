import type { UpdateCategoryDto } from '~/types/database'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody<UpdateCategoryDto>(event)

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

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: body,
    })

    return {
      success: true,
      data: updatedCategory,
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '更新分类失败',
    })
  }
})
