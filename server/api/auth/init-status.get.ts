import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const userCount = await prisma.user.count()

    return {
      success: true,
      data: {
        initialized: userCount > 0,
        needsSetup: userCount === 0,
      },
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: '检查初始化状态失败',
    })
  }
})
