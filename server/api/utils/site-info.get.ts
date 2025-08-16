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

    // 获取网页内容
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      signal: AbortSignal.timeout(10000), // 10秒超时
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()

    // 解析HTML获取基本信息
    const siteInfo = {
      title: '',
      description: '',
      domain: urlObj.hostname,
      url,
    }

    // 提取title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch && titleMatch[1]) {
      siteInfo.title = titleMatch[1].trim()
    }

    // 提取meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i)
    if (descMatch && descMatch[1]) {
      siteInfo.description = descMatch[1].trim()
    }

    // 如果没有找到description，尝试找og:description
    if (!siteInfo.description) {
      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["'][^>]*>/i)
      if (ogDescMatch && ogDescMatch[1]) {
        siteInfo.description = ogDescMatch[1].trim()
      }
    }

    // 如果title为空，使用domain作为fallback
    if (!siteInfo.title) {
      siteInfo.title = urlObj.hostname
    }

    return {
      success: true,
      data: siteInfo,
    }
  }
  catch {
    throw createError({
      statusCode: 400,
      statusMessage: '无法获取网站信息，请检查URL是否有效',
    })
  }
})
