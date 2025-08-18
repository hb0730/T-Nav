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
    if (!data.links || !Array.isArray(data.links)) {
      throw createError({
        statusCode: 400,
        statusMessage: '数据格式不正确，请上传通过"导出链接"功能生成的JSON文件',
      })
    }

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      let imported = 0
      let updated = 0
      let skipped = 0
      const errors: string[] = []

      // 获取所有现有分类，用于验证
      const existingCategories = await prisma.category.findMany({
        select: { id: true, title: true },
      })
      const categoryMap = new Map(existingCategories.map(cat => [cat.id, cat]))

      // 开始事务
      await prisma.$transaction(async (tx) => {
        for (const link of data.links) {
          try {
            // 验证分类是否存在
            if (!categoryMap.has(link.categoryId)) {
              errors.push(`链接"${link.title}"的分类ID不存在: ${link.categoryId}`)
              skipped++
              continue
            }

            // 检查链接是否已存在（通过ID或URL）
            const existing = await tx.link.findFirst({
              where: {
                OR: [
                  { id: link.id },
                  { url: link.url },
                ],
              },
            })

            if (existing) {
              // 更新现有链接
              await tx.link.update({
                where: { id: existing.id },
                data: {
                  title: link.title,
                  url: link.url,
                  logo: link.logo,
                  description: link.description,
                  tags: link.tags,
                  order: link.order,
                  deprecated: link.deprecated || false,
                  categoryId: link.categoryId,
                  updatedAt: new Date(),
                },
              })
              updated++
            }
            else {
              // 创建新链接
              try {
                await tx.link.create({
                  data: {
                    id: link.id,
                    title: link.title,
                    url: link.url,
                    logo: link.logo,
                    description: link.description,
                    tags: link.tags,
                    order: link.order,
                    deprecated: link.deprecated || false,
                    categoryId: link.categoryId,
                    createdAt: new Date(link.createdAt || new Date()),
                    updatedAt: new Date(),
                  },
                })
                imported++
              }
              catch {
                // 如果ID冲突，尝试不使用原ID创建
                await tx.link.create({
                  data: {
                    title: link.title,
                    url: link.url,
                    logo: link.logo,
                    description: link.description,
                    tags: link.tags,
                    order: link.order,
                    deprecated: link.deprecated || false,
                    categoryId: link.categoryId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  },
                })
                imported++
              }
            }
          }
          catch (error) {
            errors.push(`处理链接"${link.title}"时出错: ${(error as Error).message}`)
            skipped++
          }
        }
      })

      return {
        success: true,
        message: '链接数据导入完成',
        statistics: {
          total: data.links.length,
          imported,
          updated,
          skipped,
        },
        errors: errors.length > 0 ? errors : undefined,
      }
    }
    finally {
      await prisma.$disconnect()
    }
  }
  catch (error) {
    console.error('导入链接数据失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `导入链接数据失败: ${(error as Error).message}`,
    })
  }
})
