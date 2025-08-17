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

    // 验证数据格式 - 检查是否包含导出的数据结构
    if (!data.categories && !data.links && !data.friendLinks && !data.siteConfig) {
      throw createError({
        statusCode: 400,
        statusMessage: '数据格式不正确，请上传通过"仅导出数据"功能生成的JSON文件',
      })
    }

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // 开始事务
      await prisma.$transaction(async (tx) => {
        // 清空现有数据（除了用户数据，避免锁定管理员）
        await tx.linkSubmission.deleteMany()
        await tx.friendLinkSubmission.deleteMany()
        await tx.link.deleteMany()
        await tx.friendLink.deleteMany()
        await tx.category.deleteMany()
        await tx.siteConfig.deleteMany()

        // 恢复分类数据
        if (data.categories && data.categories.length > 0) {
          for (const category of data.categories) {
            await tx.category.create({
              data: {
                id: category.id,
                title: category.title,
                icon: category.icon,
                order: category.order,
                createdAt: new Date(category.createdAt),
                updatedAt: new Date(category.updatedAt),
              },
            })
          }
        }

        // 恢复链接数据
        if (data.links && data.links.length > 0) {
          for (const link of data.links) {
            await tx.link.create({
              data: {
                id: link.id,
                title: link.title,
                url: link.url,
                logo: link.logo,
                description: link.description,
                tags: link.tags,
                order: link.order,
                deprecated: link.deprecated,
                categoryId: link.categoryId,
                createdAt: new Date(link.createdAt),
                updatedAt: new Date(link.updatedAt),
              },
            })
          }
        }

        // 恢复友情链接数据
        if (data.friendLinks && data.friendLinks.length > 0) {
          for (const friendLink of data.friendLinks) {
            await tx.friendLink.create({
              data: {
                id: friendLink.id,
                title: friendLink.title,
                url: friendLink.url,
                logo: friendLink.logo,
                description: friendLink.description,
                order: friendLink.order,
                createdAt: new Date(friendLink.createdAt),
                updatedAt: new Date(friendLink.updatedAt),
              },
            })
          }
        }

        // 恢复站点配置
        if (data.siteConfig && data.siteConfig.length > 0) {
          for (const config of data.siteConfig) {
            await tx.siteConfig.create({
              data: {
                id: config.id,
                name: config.name,
                description: config.description,
                keywords: config.keywords,
                author: config.author,
                authorLink: config.authorLink,
                url: config.url,
                logo: config.logo,
                icon: config.icon,
                icp: config.icp,
                defaultLocale: config.defaultLocale,
                env: config.env,
                createdAt: new Date(config.createdAt),
                updatedAt: new Date(config.updatedAt),
              },
            })
          }
        }

        // 恢复申请数据
        if (data.friendLinkSubmissions && data.friendLinkSubmissions.length > 0) {
          for (const submission of data.friendLinkSubmissions) {
            await tx.friendLinkSubmission.create({
              data: {
                id: submission.id,
                title: submission.title,
                url: submission.url,
                logo: submission.logo,
                description: submission.description,
                contact: submission.contact,
                status: submission.status,
                reason: submission.reason,
                createdAt: new Date(submission.createdAt),
                updatedAt: new Date(submission.updatedAt),
              },
            })
          }
        }

        if (data.linkSubmissions && data.linkSubmissions.length > 0) {
          for (const submission of data.linkSubmissions) {
            await tx.linkSubmission.create({
              data: {
                id: submission.id,
                title: submission.title,
                url: submission.url,
                logo: submission.logo,
                description: submission.description,
                categoryId: submission.categoryId,
                tags: submission.tags,
                contact: submission.contact,
                status: submission.status,
                reason: submission.reason,
                createdAt: new Date(submission.createdAt),
                updatedAt: new Date(submission.updatedAt),
              },
            })
          }
        }
      })

      return {
        success: true,
        message: '数据恢复成功',
      }
    }
    finally {
      await prisma.$disconnect()
    }
  }
  catch (error) {
    console.error('恢复数据失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `恢复数据失败: ${(error as Error).message}`,
    })
  }
})
