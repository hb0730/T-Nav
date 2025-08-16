import { Storage } from '../utils/storage'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: '链接ID不能为空',
      })
    }

    const links = await Storage.getLinks()
    const filteredLinks = links.filter(link => link.id !== id)

    if (filteredLinks.length === links.length) {
      throw createError({
        statusCode: 404,
        statusMessage: '链接不存在',
      })
    }

    await Storage.saveLinks(filteredLinks)

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
