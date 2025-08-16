import type { CreateLinkDto } from '~/types/database'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreateLinkDto>(event)

    if (!body.title || !body.url || !body.categoryId) {
      throw createError({
        statusCode: 400,
        statusMessage: '标题、链接地址和分类ID不能为空',
      })
    }

    // 验证分类是否存在
    const categoryExists = await prisma.category.findUnique({
      where: { id: body.categoryId },
    })

    if (!categoryExists) {
      throw createError({
        statusCode: 400,
        statusMessage: '指定的分类不存在',
      })
    }

    // 如果没有指定排序，使用当前分类下最大排序值+1
    let order = body.order
    if (order === undefined) {
      const maxLink = await prisma.link.findFirst({
        where: { categoryId: body.categoryId },
        orderBy: { order: 'desc' },
      })
      order = (maxLink?.order ?? -1) + 1
    }

    const newLink = await prisma.link.create({
      data: {
        title: body.title,
        url: body.url,
        logo: body.logo,
        description: body.description,
        tags: body.tags ? JSON.stringify(body.tags) : null,
        categoryId: body.categoryId,
        order,
        deprecated: body.deprecated || false,
      },
    })

    // 将序列化的tags字段转换为数组返回
    const formattedLink = {
      ...newLink,
      tags: newLink.tags ? JSON.parse(newLink.tags) : [],
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
      statusMessage: '创建链接失败',
    })
  }
})
