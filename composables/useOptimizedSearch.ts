import { useDebounceFn, useLocalStorage } from '@vueuse/core'
import { computed, ref, watchEffect } from 'vue'

export interface SearchableLink {
  id: string
  title: string
  url: string
  logo?: string
  description?: string
  tags: string[]
  category?: {
    id: string
    title: string
    icon?: string
  }
  deprecated: boolean
}

export interface SearchPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface SearchResponse {
  results: SearchableLink[]
  pagination: SearchPagination
  query: string
}

export interface SearchOptions {
  pageSize?: number
  debounceMs?: number
  enableCache?: boolean
  autoSearch?: boolean
  enableHistory?: boolean
}

const DEFAULT_OPTIONS: Required<SearchOptions> = {
  pageSize: 20,
  debounceMs: 300,
  enableCache: true,
  autoSearch: true,
  enableHistory: true,
}

/**
 * 优化的搜索组合式函数 - 支持分页和服务端搜索
 */
export function useOptimizedSearch(
  options: SearchOptions = {},
  externalQuery?: Ref<string>,
) {
  const config = { ...DEFAULT_OPTIONS, ...options }
  const searchQuery = externalQuery || ref('')
  const isSearching = ref(false)
  const searchHistory = config.enableHistory
    ? useLocalStorage<string[]>('search-history-v2', [])
    : ref<string[]>([])

  // 搜索结果状态
  const searchResults = ref<SearchableLink[]>([])
  const pagination = ref<SearchPagination>({
    page: 1,
    pageSize: config.pageSize,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })

  // 搜索结果缓存 - 按查询和页码缓存
  const searchCache = new Map<string, SearchResponse>()

  // 生成缓存键
  function getCacheKey(query: string, page: number): string {
    return `${query.toLowerCase().trim()}:${page}`
  }

  // 执行搜索
  async function performSearch(query: string, page: number = 1): Promise<SearchResponse> {
    const trimmedQuery = query.trim()
    const cacheKey = getCacheKey(trimmedQuery, page)

    // 检查缓存
    if (config.enableCache && searchCache.has(cacheKey)) {
      return searchCache.get(cacheKey)!
    }

    // 发起API请求
    const response = await $fetch<{ success: boolean, data: SearchResponse }>('/api/search', {
      query: {
        q: trimmedQuery,
        page,
        pageSize: config.pageSize,
      },
    })

    if (!response.success) {
      throw new Error('搜索请求失败')
    }

    const result = response.data

    // 缓存结果（最多缓存100个搜索结果）
    if (config.enableCache) {
      if (searchCache.size >= 100) {
        // 清除最旧的缓存项
        const firstKey = searchCache.keys().next().value
        if (firstKey) {
          searchCache.delete(firstKey)
        }
      }
      searchCache.set(cacheKey, result)
    }

    return result
  }

  // 防抖搜索函数
  const debouncedSearch = useDebounceFn(async (query: string, page: number = 1) => {
    if (!query.trim()) {
      searchResults.value = []
      pagination.value = {
        page: 1,
        pageSize: config.pageSize,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      }
      isSearching.value = false
      return
    }

    isSearching.value = true
    try {
      const result = await performSearch(query, page)

      // 如果是第一页，替换结果；否则追加结果（用于无限滚动）
      if (page === 1) {
        searchResults.value = result.results
      }
      else {
        searchResults.value.push(...result.results)
      }

      pagination.value = result.pagination

      // 添加到搜索历史
      if (query.trim() && page === 1) {
        addToHistory(query.trim())
      }
    }
    catch (error) {
      console.error('搜索失败:', error)
      // 保持当前状态，不清空结果
    }
    finally {
      isSearching.value = false
    }
  }, config.debounceMs)

  // 立即搜索（不防抖）
  async function searchNow(query: string, page: number = 1) {
    await debouncedSearch(query, page)
  }

  // 加载更多结果
  async function loadMore() {
    if (!pagination.value.hasNextPage || isSearching.value || !searchQuery.value.trim()) {
      return
    }

    await searchNow(searchQuery.value, pagination.value.page + 1)
  }

  // 重新搜索当前查询
  async function refreshSearch() {
    if (!searchQuery.value.trim()) {
      return
    }

    // 清除相关缓存
    const query = searchQuery.value.trim().toLowerCase()
    const keysToDelete = Array.from(searchCache.keys()).filter(key =>
      key.startsWith(`${query}:`),
    )
    keysToDelete.forEach(key => searchCache.delete(key))

    await searchNow(searchQuery.value, 1)
  }

  // 添加到搜索历史
  function addToHistory(query: string) {
    if (!config.enableHistory || !query.trim())
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
    if (history.length > 50) {
      history.splice(50)
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

  // 清空搜索结果
  function clearResults() {
    searchResults.value = []
    searchQuery.value = ''
    pagination.value = {
      page: 1,
      pageSize: config.pageSize,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    }
  }

  // 高亮匹配文本
  function highlightText(text: string, query: string): string {
    if (!text || !query)
      return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  // 计算高亮结果
  const highlightedResults = computed(() => {
    const query = searchQuery.value.trim()
    if (!query)
      return searchResults.value

    return searchResults.value.map(result => ({
      ...result,
      highlightedTitle: highlightText(result.title, query),
      highlightedDescription: result.description ? highlightText(result.description, query) : undefined,
      highlightedTags: result.tags.map(tag => highlightText(tag, query)),
    }))
  })

  // 自动搜索监听
  if (config.autoSearch) {
    watchEffect(() => {
      const query = searchQuery.value
      debouncedSearch(query, 1)
    })
  }

  // 搜索统计信息
  const searchStats = computed(() => ({
    hasResults: searchResults.value.length > 0,
    totalResults: pagination.value.total,
    currentPage: pagination.value.page,
    totalPages: pagination.value.totalPages,
    isLastPage: !pagination.value.hasNextPage,
    resultsText: `共找到 ${pagination.value.total} 个结果`,
  }))

  return {
    // 响应式状态
    searchQuery,
    searchResults: readonly(searchResults),
    highlightedResults,
    pagination: readonly(pagination),
    isSearching: readonly(isSearching),
    searchHistory: readonly(searchHistory),
    searchStats,

    // 方法
    searchNow,
    loadMore,
    refreshSearch,
    clearHistory,
    clearCache,
    clearResults,
    addToHistory,
    highlightText,
  }
}
