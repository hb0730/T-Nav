import { backupService } from '~/server/utils/backup'

export default defineEventHandler(async (event) => {
  try {
    const data = await backupService.exportDatabaseData()

    // 设置响应头为JSON下载
    setHeader(event, 'Content-Type', 'application/json')
    setHeader(event, 'Content-Disposition', `attachment; filename="data-export-${new Date().toISOString().split('T')[0]}.json"`)

    return data
  }
  catch (error) {
    console.error('导出数据失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `导出数据失败: ${(error as Error).message}`,
    })
  }
})
