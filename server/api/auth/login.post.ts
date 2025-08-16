import type { LoginDto } from '~/types/database'
import { generateToken, verifyPassword } from '~/lib/auth'
import { prisma } from '~/server/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<LoginDto>(event)

    if (!body.username || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: '用户名和密码不能为空',
      })
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username: body.username },
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: '用户名或密码错误',
      })
    }

    // 验证密码
    const isValidPassword = await verifyPassword(body.password, user.password)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: '用户名或密码错误',
      })
    }

    // 生成token
    const { password, ...userWithoutPassword } = user
    const token = generateToken(userWithoutPassword)

    return {
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '登录失败',
    })
  }
})
