import { prisma } from '~/server/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少友情链接ID',
      })
    }

    const { title, url, logo, description, order } = body

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

    const friendLink = await prisma.friendLink.update({
      where: { id },
      data: {
        title: title || existingFriendLink.title,
        url: url || existingFriendLink.url,
        logo: logo !== undefined ? logo : existingFriendLink.logo,
        description: description !== undefined ? description : existingFriendLink.description,
        order: order !== undefined ? order : existingFriendLink.order,
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
      statusMessage: '更新友情链接失败',
    })
  }
})
