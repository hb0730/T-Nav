export default defineEventHandler(async (event) => {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      const categories = await prisma.category.findMany({
        orderBy: { order: 'asc' },
      })

      // 设置响应头为JSON下载
      setHeader(event, 'Content-Type', 'application/json')
      setHeader(event, 'Content-Disposition', `attachment; filename="categories-export-${new Date().toISOString().split('T')[0]}.json"`)

      return {
        categories,
        exportedAt: new Date().toISOString(),
        total: categories.length,
      }
    }
    finally {
      await prisma.$disconnect()
    }
  }
  catch (error) {
    console.error('导出分类数据失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `导出分类数据失败: ${(error as Error).message}`,
    })
  }
})