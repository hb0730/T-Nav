import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    // TODO: 添加管理员权限验证

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少申请ID',
      })
    }

    if (!body.status || !['pending', 'approved', 'rejected'].includes(body.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: '无效的状态值',
      })
    }

    // 更新导航站申请状态
    const submission = await prisma.linkSubmission.update({
      where: { id },
      data: {
        status: body.status,
        reason: body.reason || null,
      },
    })

    // 如果批准申请，创建导航站记录
    if (body.status === 'approved') {
      await prisma.link.create({
        data: {
          title: submission.title,
          url: submission.url,
          logo: submission.logo,
          description: submission.description,
          categoryId: submission.categoryId || await getDefaultCategoryId(),
          tags: submission.tags,
          order: 0,
        },
      })
    }

    return {
      success: true,
      data: submission,
      message: '申请状态更新成功',
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '服务器内部错误',
    })
  }
})

// 获取默认分类ID
async function getDefaultCategoryId() {
  const defaultCategory = await prisma.category.findFirst({
    orderBy: { order: 'asc' },
  })
  return defaultCategory?.id || ''
}
