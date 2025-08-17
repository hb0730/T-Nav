import { computed, ref } from 'vue'

interface IconCacheItem {
  timestamp: number
  accessed: number
  data: any
}

export function useIconCache() {
  const cache = ref<Map<string, IconCacheItem>>(new Map())
  const maxCacheSize = 1000
  const maxAge = 5 * 60 * 1000 // 5分钟

  // 清理过期缓存
  const cleanup = () => {
    const now = Date.now()
    const entries = Array.from(cache.value.entries())
    
    // 移除过期项
    for (const [key, item] of entries) {
      if (now - item.timestamp > maxAge) {
        cache.value.delete(key)
      }
    }
    
    // 如果仍然超过限制，移除最少使用的项
    if (cache.value.size > maxCacheSize) {
      const sortedEntries = entries
        .sort((a, b) => a[1].accessed - b[1].accessed)
        .slice(0, entries.length - maxCacheSize)
      
      for (const [key] of sortedEntries) {
        cache.value.delete(key)
      }
    }
  }

  const get = (key: string) => {
    const item = cache.value.get(key)
    if (item) {
      item.accessed = Date.now()
      return item.data
    }
    return null
  }

  const set = (key: string, data: any) => {
    cleanup()
    cache.value.set(key, {
      timestamp: Date.now(),
      accessed: Date.now(),
      data
    })
  }

  const has = (key: string) => {
    const item = cache.value.get(key)
    if (item && Date.now() - item.timestamp <= maxAge) {
      return true
    }
    if (item) {
      cache.value.delete(key)
    }
    return false
  }

  const clear = () => {
    cache.value.clear()
  }

  const size = computed(() => cache.value.size)

  return {
    get,
    set,
    has,
    clear,
    size
  }
}