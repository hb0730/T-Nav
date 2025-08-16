import type { CreateCategoryDto } from '~/types/database'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreateCategoryDto>(event)

    if (!body.title) {
      throw createError({
        statusCode: 400,
        statusMessage: '分类标题不能为空',
      })
    }

    // 如果没有指定排序，使用当前最大排序值+1
    let order = body.order
    if (order === undefined) {
      const maxCategory = await prisma.category.findFirst({
        orderBy: { order: 'desc' },
      })
      order = (maxCategory?.order ?? -1) + 1
    }

    const newCategory = await prisma.category.create({
      data: {
        title: body.title,
        icon: body.icon,
        order,
      },
    })

    return {
      success: true,
      data: newCategory,
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '创建分类失败',
    })
  }
})
