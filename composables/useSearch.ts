import { useDebounceFn, useLocalStorage } from '@vueuse/core'
import type { Ref } from 'vue'

export interface SearchResult {
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
}

export interface SearchOptions {
  debounce?: number
  pageSize?: number
  enableHistory?: boolean
  enableCache?: boolean
}

/**
 * 简化的搜索 Composable
 * 统一所有搜索功能，减少代码复杂度
 */
export function useSearch(options: SearchOptions = {}) {
  const {
    debounce = 300,
    pageSize = 20,
    enableHistory = true,
    enableCache = true,
  } = options

  // 搜索状态
  const query = ref('')
  const results = ref<SearchResult[]>([])
  const isLoading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const hasMore = ref(false)

  // 搜索历史
  const history = enableHistory 
    ? useLocalStorage<string[]>('search-history', [])
    : ref<string[]>([])

  // 简单缓存
  const cache = enableCache ? new Map<string, SearchResult[]>() : null

  // 执行搜索
  async function search(q: string = query.value, p: number = 1) {
    if (!q.trim()) {
      results.value = []
      total.value = 0
      hasMore.value = false
      return
    }

    // 检查缓存
    const cacheKey = `${q}:${p}`
    if (cache?.has(cacheKey)) {
      const cached = cache.get(cacheKey)!
      if (p === 1) {
        results.value = cached
      } else {
        results.value.push(...cached)
      }
      return
    }

    isLoading.value = true
    
    try {
      const response = await $fetch<{
        success: boolean
        data: {
          results: SearchResult[]
          pagination: {
            total: number
            page: number
            hasNextPage: boolean
          }
        }
      }>('/api/search', {
        query: { q, page: p, pageSize }
      })

      if (response.success) {
        const { results: newResults, pagination } = response.data
        
        // 缓存结果
        if (cache && newResults.length > 0) {
          cache.set(cacheKey, newResults)
        }

        // 更新状态
        if (p === 1) {
          results.value = newResults
        } else {
          results.value.push(...newResults)
        }
        
        total.value = pagination.total
        page.value = p
        hasMore.value = pagination.hasNextPage

        // 添加到历史记录
        if (p === 1 && enableHistory) {
          addToHistory(q)
        }
      }
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 防抖搜索
  const debouncedSearch = useDebounceFn(search, debounce)

  // 监听查询变化
  watchEffect(() => {
    if (query.value.trim()) {
      debouncedSearch(query.value, 1)
    } else {
      results.value = []
      total.value = 0
      hasMore.value = false
    }
  })

  // 加载更多
  async function loadMore() {
    if (!hasMore.value || isLoading.value) return
    await search(query.value, page.value + 1)
  }

  // 搜索历史管理
  function addToHistory(q: string) {
    if (!enableHistory || !q.trim()) return
    
    const trimmed = q.trim()
    const idx = history.value.indexOf(trimmed)
    
    if (idx > -1) {
      history.value.splice(idx, 1)
    }
    
    history.value.unshift(trimmed)
    
    if (history.value.length > 20) {
      history.value.splice(20)
    }
  }

  function clearHistory() {
    history.value = []
  }

  // 清空搜索
  function clear() {
    query.value = ''
    results.value = []
    total.value = 0
    page.value = 1
    hasMore.value = false
  }

  // 高亮文本
  function highlight(text: string, q: string = query.value): string {
    if (!text || !q) return text
    
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  return {
    // 状态
    query,
    results: readonly(results),
    isLoading: readonly(isLoading),
    total: readonly(total),
    hasMore: readonly(hasMore),
    history: readonly(history),

    // 方法
    search,
    loadMore,
    clear,
    clearHistory,
    highlight,
  }
}