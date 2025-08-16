import type { UpdateLinkDto } from '~/types/database'
import { Storage } from '../utils/storage'

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
      const categories = await Storage.getCategories()
      const categoryExists = categories.some(cat => cat.id === body.categoryId)
      if (!categoryExists) {
        throw createError({
          statusCode: 400,
          statusMessage: '指定的分类不存在',
        })
      }
    }

    const links = await Storage.getLinks()
    const linkIndex = links.findIndex(link => link.id === id)

    if (linkIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: '链接不存在',
      })
    }

    const updatedLink = {
      ...links[linkIndex],
      ...body,
      updatedAt: new Date(),
    }

    links[linkIndex] = updatedLink
    await Storage.saveLinks(links)

    return {
      success: true,
      data: updatedLink,
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
