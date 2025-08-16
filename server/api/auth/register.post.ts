import type { CreateUserDto } from '~/types/database'
import { generateToken, hashPassword } from '~/lib/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreateUserDto>(event)

    if (!body.username || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: '用户名和密码不能为空',
      })
    }

    // 检查是否已有用户存在
    const existingUsersCount = await prisma.user.count()
    if (existingUsersCount > 0) {
      throw createError({
        statusCode: 403,
        statusMessage: '系统已初始化，禁止注册新用户',
      })
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username: body.username },
    })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: '用户名已存在',
      })
    }

    // 创建用户
    const hashedPassword = await hashPassword(body.password)
    const user = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        password: hashedPassword,
        role: 'ADMIN', // 第一个用户默认为管理员
      },
    })

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
      statusMessage: '注册失败',
    })
  }
})
