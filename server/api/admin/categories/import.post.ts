export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '没有上传文件',
      })
    }

    const file = formData[0]
    if (!file.filename || !file.filename.endsWith('.json')) {
      throw createError({
        statusCode: 400,
        statusMessage: '只支持JSON格式的数据文件',
      })
    }

    const data = JSON.parse(file.data.toString())
    
    // 验证数据格式
    if (!data.categories || !Array.isArray(data.categories)) {
      throw createError({
        statusCode: 400,
        statusMessage: '数据格式不正确，请上传通过"导出分类"功能生成的JSON文件',
      })
    }

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      let imported = 0
      let updated = 0
      let skipped = 0

      // 开始事务
      await prisma.$transaction(async (tx) => {
        for (const category of data.categories) {
          // 检查分类是否已存在（通过ID或标题）
          const existing = await tx.category.findFirst({
            where: {
              OR: [
                { id: category.id },
                { title: category.title },
              ],
            },
          })

          if (existing) {
            // 更新现有分类
            await tx.category.update({
              where: { id: existing.id },
              data: {
                title: category.title,
                icon: category.icon,
                order: category.order,
                updatedAt: new Date(),
              },
            })
            updated++
          }
          else {
            // 创建新分类
            try {
              await tx.category.create({
                data: {
                  id: category.id,
                  title: category.title,
                  icon: category.icon,
                  order: category.order,
                  createdAt: new Date(category.createdAt || new Date()),
                  updatedAt: new Date(),
                },
              })
              imported++
            }
            catch {
              // 如果ID冲突，尝试不使用原ID创建
              await tx.category.create({
                data: {
                  title: category.title,
                  icon: category.icon,
                  order: category.order,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              })
              imported++
            }
          }
        }
      })

      return {
        success: true,
        message: '分类数据导入成功',
        statistics: {
          total: data.categories.length,
          imported,
          updated,
          skipped,
        },
      }
    }
    finally {
      await prisma.$disconnect()
    }
  }
  catch (error) {
    console.error('导入分类数据失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `导入分类数据失败: ${(error as Error).message}`,
    })
  }
})