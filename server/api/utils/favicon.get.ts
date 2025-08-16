export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少URL参数',
    })
  }

  try {
    // 验证URL格式
    const urlObj = new URL(url)
    const domain = urlObj.origin

    // 尝试多种常见的favicon路径
    const faviconPaths = [
      '/favicon.ico',
      '/favicon.png',
      '/favicon.svg',
      '/apple-touch-icon.png',
      '/icon.png',
      '/icon.ico',
    ]

    // 尝试获取favicon
    for (const path of faviconPaths) {
      const faviconUrl = domain + path
      try {
        const response = await fetch(faviconUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000), // 5秒超时
        })

        if (response.ok && response.headers.get('content-type')?.includes('image')) {
          return {
            success: true,
            data: {
              url: faviconUrl,
              domain,
            },
          }
        }
      }
      catch {
        // 继续尝试下一个路径
        continue
      }
    }

    // 如果所有路径都失败，返回Google的favicon服务
    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`

    return {
      success: true,
      data: {
        url: googleFaviconUrl,
        domain,
        fallback: true,
      },
    }
  }
  catch {
    throw createError({
      statusCode: 400,
      statusMessage: '无效的URL格式',
    })
  }
})
