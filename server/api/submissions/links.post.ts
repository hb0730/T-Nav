import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // 验证必填字段
    if (!body.title || !body.url) {
      throw createError({
        statusCode: 400,
        statusMessage: '标题和URL为必填项',
      })
    }

    // 验证URL格式
    try {
      new URL(body.url)
    }
    catch {
      throw createError({
        statusCode: 400,
        statusMessage: '请输入有效的URL格式',
      })
    }

    // 检查是否已存在相同的申请
    const existingSubmission = await prisma.linkSubmission.findFirst({
      where: { url: body.url },
    })

    if (existingSubmission) {
      throw createError({
        statusCode: 409,
        statusMessage: '该网站已提交过申请',
      })
    }

    // 创建导航站申请
    const submission = await prisma.linkSubmission.create({
      data: {
        title: body.title,
        url: body.url,
        logo: body.logo,
        description: body.description,
        categoryId: body.categoryId,
        tags: body.tags ? JSON.stringify(body.tags) : null,
        contact: body.contact,
      },
    })

    return {
      success: true,
      data: submission,
      message: '导航站申请提交成功，我们会尽快审核！',
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
