export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const categoryId = query.categoryId as string | undefined

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      const whereCondition = categoryId ? { categoryId } : {}
      
      const links = await prisma.link.findMany({
        where: whereCondition,
        include: {
          category: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      })

      // 设置响应头为JSON下载
      const filename = categoryId 
        ? `links-category-${categoryId}-export-${new Date().toISOString().split('T')[0]}.json`
        : `links-export-${new Date().toISOString().split('T')[0]}.json`
      
      setHeader(event, 'Content-Type', 'application/json')
      setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)

      return {
        links,
        categoryFilter: categoryId || null,
        exportedAt: new Date().toISOString(),
        total: links.length,
      }
    }
    finally {
      await prisma.$disconnect()
    }
  }
  catch (error) {
    console.error('导出链接数据失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `导出链接数据失败: ${(error as Error).message}`,
    })
  }
})