import { prisma } from '~/server/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const { title, url, logo, description, order } = body

    if (!title || !url) {
      throw createError({
        statusCode: 400,
        statusMessage: '标题和链接为必填项',
      })
    }

    const friendLink = await prisma.friendLink.create({
      data: {
        title,
        url,
        logo: logo || '',
        description: description || '',
        order: order || 0,
      },
    })

    return {
      success: true,
      data: friendLink,
    }
  }
  catch (error) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '创建友情链接失败',
    })
  }
})
