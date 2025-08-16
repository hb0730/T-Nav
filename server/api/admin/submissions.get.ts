import { PrismaClient } from '@prisma/client'
import { verifyAuth } from '~/lib/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const status = query.status as string

    // 构建查询条件
    const where = status ? { status } : {}

    // 获取友链申请
    const friendLinkSubmissions = await prisma.friendLinkSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // 获取导航站申请
    const linkSubmissions = await prisma.linkSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return {
      success: true,
      data: {
        friendLinks: friendLinkSubmissions,
        links: linkSubmissions,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '服务器内部错误',
    })
  }
})