import { extractUserFromToken } from '~/lib/auth'
import { prisma } from '~/server/prisma'

export default defineEventHandler(async (event) => {
  try {
    const authorization = getHeader(event, 'authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: '未提供认证令牌',
      })
    }

    const token = authorization.replace('Bearer ', '')
    const decoded = extractUserFromToken(token)

    if (!decoded) {
      throw createError({
        statusCode: 401,
        statusMessage: '无效的认证令牌',
      })
    }

    // 从数据库获取最新用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: '用户不存在',
      })
    }

    return {
      success: true,
      data: user,
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '获取用户信息失败',
    })
  }
})
