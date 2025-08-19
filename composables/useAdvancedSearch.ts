import { useDebounceFn, useLocalStorage } from '@vueuse/core'
import { computed, ref, watchEffect } from 'vue'

export interface SearchableItem {
  id: string
  title: string
  url?: string
  description?: string
  tags?: string[]
  category?: string
  [key: string]: any
}

export interface SearchResult extends SearchableItem {
  score: number
  highlightedTitle?: string
  highlightedDescription?: string
  matchedFields: string[]
}

export interface SearchOptions {
  fields?: string[]
  threshold?: number
  maxResults?: number
  includeScore?: boolean
  enableCache?: boolean
  debounceMs?: number
}

const DEFAULT_OPTIONS: Required<SearchOptions> = {
  fields: ['title', 'description', 'tags', 'url'],
  threshold: 0.3,
  maxResults: 50,
  includeScore: true,
  enableCache: true,
  debounceMs: 300,
}

/**
 * 高级搜索组合式函数
 */
export function useAdvancedSearch<T extends SearchableItem>(
  items: Ref<T[]> | T[],
  options: SearchOptions = {},
  externalQuery?: Ref<string>,
) {
  const config = { ...DEFAULT_OPTIONS, ...options }
  const searchQuery = externalQuery || ref('')
  const isSearching = ref(false)
  const searchHistory = useLocalStorage<string[]>('search-history', [])

  // 搜索结果缓存
  const searchCache = new Map<string, SearchResult[]>()

  // 计算相似度分数（使用 Jaro-Winkler 算法的简化版本）
  function calculateSimilarity(query: string, target: string): number {
    if (!query || !target)
      return 0

    const queryLower = query.toLowerCase()
    const targetLower = target.toLowerCase()

    // 完全匹配
    if (targetLower === queryLower)
      return 1

    // 包含匹配
    if (targetLower.includes(queryLower)) {
      const ratio = queryLower.length / targetLower.length
      return 0.8 * ratio
    }

    // 模糊匹配（基于编辑距离）
    const distance = levenshteinDistance(queryLower, targetLower)
    const maxLength = Math.max(queryLower.length, targetLower.length)
    return 1 - distance / maxLength
  }

  // 计算编辑距离
  function levenshteinDistance(a: string, b: string): number {
    if (a.length === 0)
      return b.length
    if (b.length === 0)
      return a.length

    const matrix = Array.from({ length: b.length + 1 }).fill(null).map(() => Array.from({ length: a.length + 1 }).fill(null))

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // 插入
          matrix[j - 1][i] + 1, // 删除
          matrix[j - 1][i - 1] + cost, // 替换
        )
      }
    }

    return matrix[b.length][a.length]
  }

  // 高亮匹配文本
  function highlightText(text: string, query: string): string {
    if (!text || !query)
      return text

    const queryLower = query.toLowerCase()
    const textLower = text.toLowerCase()

    // 找到所有匹配位置
    const matches: Array<{ start: number, end: number }> = []
    let index = textLower.indexOf(queryLower)

    while (index !== -1) {
      matches.push({ start: index, end: index + query.length })
      index = textLower.indexOf(queryLower, index + 1)
    }

    if (matches.length === 0)
      return text

    // 构建高亮文本，使用简单的样式标记
    let highlighted = ''
    let lastEnd = 0

    matches.forEach((match) => {
      highlighted += text.slice(lastEnd, match.start)
      highlighted += `<span style="background-color: #fef08a; padding: 0 1px; border-radius: 2px;">${text.slice(match.start, match.end)}</span>`
      lastEnd = match.end
    })

    highlighted += text.slice(lastEnd)
    return highlighted
  }

  // 执行搜索
  function performSearch(query: string, data: T[]): SearchResult[] {
    if (!query.trim())
      return []

    // 检查缓存
    if (config.enableCache && searchCache.has(query)) {
      return searchCache.get(query)!
    }

    const results: SearchResult[] = []
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0)

    data.forEach((item) => {
      let totalScore = 0
      const matchedFields: string[] = []
      const scores: Record<string, number> = {}

      // 计算每个字段的匹配分数
      config.fields.forEach((field) => {
        const value = item[field]
        if (!value)
          return

        let fieldText = ''
        if (Array.isArray(value)) {
          fieldText = value.join(' ')
        }
        else {
          fieldText = String(value)
        }

        let fieldScore = 0
        queryWords.forEach((word) => {
          const similarity = calculateSimilarity(word, fieldText)
          fieldScore = Math.max(fieldScore, similarity)
        })

        if (fieldScore > config.threshold) {
          scores[field] = fieldScore
          matchedFields.push(field)

          // 不同字段给予不同权重
          const weight = getFieldWeight(field)
          totalScore += fieldScore * weight
        }
      })

      // 如果有匹配的字段，添加到结果中
      if (matchedFields.length > 0) {
        const result: SearchResult = {
          ...item,
          score: totalScore / matchedFields.length,
          matchedFields,
        }

        // 添加高亮
        if (scores.title && item.title) {
          result.highlightedTitle = highlightText(item.title, query)
        }
        if (scores.description && item.description) {
          result.highlightedDescription = highlightText(item.description, query)
        }

        results.push(result)
      }
    })

    // 按分数排序
    results.sort((a, b) => b.score - a.score)

    // 限制结果数量
    const limitedResults = results.slice(0, config.maxResults)

    // 缓存结果
    if (config.enableCache) {
      searchCache.set(query, limitedResults)
    }

    return limitedResults
  }

  // 获取字段权重
  function getFieldWeight(field: string): number {
    switch (field) {
      case 'title': return 1.0
      case 'tags': return 0.8
      case 'description': return 0.6
      case 'url': return 0.4
      default: return 0.5
    }
  }

  // 添加到搜索历史
  function addToHistory(query: string) {
    if (!query.trim())
      return

    const trimmedQuery = query.trim()
    const history = searchHistory.value

    // 移除重复项
    const index = history.indexOf(trimmedQuery)
    if (index > -1) {
      history.splice(index, 1)
    }

    // 添加到开头
    history.unshift(trimmedQuery)

    // 限制历史记录数量
    if (history.length > 20) {
      history.splice(20)
    }

    searchHistory.value = history
  }

  // 清空搜索历史
  function clearHistory() {
    searchHistory.value = []
  }

  // 清空搜索缓存
  function clearCache() {
    searchCache.clear()
  }

  // 防抖搜索
  const debouncedSearch = useDebounceFn((query: string, data: T[]) => {
    isSearching.value = true
    try {
      const results = performSearch(query, data)
      searchResults.value = results
      if (query.trim()) {
        addToHistory(query)
      }
    }
    finally {
      isSearching.value = false
    }
  }, config.debounceMs)

  // 搜索结果
  const searchResults = ref<SearchResult[]>([])

  // 监听搜索查询变化
  watchEffect(() => {
    const data = unref(items)
    const query = searchQuery.value

    if (!query.trim()) {
      searchResults.value = []
      isSearching.value = false
      return
    }

    debouncedSearch(query, data)
  })

  // 高亮的搜索结果
  const highlightedResults = computed(() => {
    return searchResults.value.map(result => ({
      ...result,
      displayTitle: result.highlightedTitle || result.title || '',
      displayDescription: result.highlightedDescription || result.description || '',
    }))
  })

  return {
    searchQuery,
    searchResults,
    highlightedResults,
    isSearching,
    searchHistory: readonly(searchHistory),

    // 方法
    clearHistory,
    clearCache,
    addToHistory,
    performSearch: (query: string) => performSearch(query, unref(items)),
  }
}
