import type { UpdateLinkDto } from '~/types/database'
import { prisma } from '~/server/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody<UpdateLinkDto>(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: '链接ID不能为空',
      })
    }

    // 如果更新了分类ID，验证分类是否存在
    if (body.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: body.categoryId },
      })
      if (!categoryExists) {
        throw createError({
          statusCode: 400,
          statusMessage: '指定的分类不存在',
        })
      }
    }

    // 查找要更新的链接
    const existingLink = await prisma.link.findUnique({
      where: { id },
    })

    if (!existingLink) {
      throw createError({
        statusCode: 404,
        statusMessage: '链接不存在',
      })
    }

    // 准备更新数据
    const updateData: any = {
      ...body,
      updatedAt: new Date(),
    }

    // 处理tags字段
    if (body.tags) {
      updateData.tags = JSON.stringify(body.tags)
    }

    const updatedLink = await prisma.link.update({
      where: { id },
      data: updateData,
    })

    // 将序列化的tags字段转换为数组返回
    const formattedLink = {
      ...updatedLink,
      tags: updatedLink.tags ? JSON.parse(updatedLink.tags) : [],
    }

    return {
      success: true,
      data: formattedLink,
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '更新链接失败',
    })
  }
})
