import { useDebounceFn, useEventListener } from '@vueuse/core'
import { useSearch } from './useSearch'

/**
 * 全局搜索状态管理 - 简化版本
 * 使用组件级别的实例，避免 SSR 单例问题
 */
export function useGlobalSearch() {
  const isOpen = ref(false)

  // 使用简化的搜索功能，禁用历史记录
  const searchInstance = useSearch({
    pageSize: 20,
    enableHistory: false,
    enableCache: true,
  })

  // 创建防抖的搜索函数
  const debouncedSearch = useDebounceFn((query: string) => {
    if (query.trim()) {
      searchInstance.search(query, 1)
    }
    else {
      // 清空搜索结果
      searchInstance.clear()
    }
  }, 300)

  // 打开/关闭搜索
  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  // 设置全局快捷键
  function setupShortcuts() {
    // 只在客户端注册快捷键和监听器
    if (import.meta.client) {
      // 注册键盘快捷键
      useEventListener(document, 'keydown', (e: KeyboardEvent) => {
        // Ctrl/Cmd + K 打开搜索
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault()
          open()
        }

        // ESC 关闭搜索
        if (e.key === 'Escape' && isOpen.value) {
          e.preventDefault()
          close()
        }
      })

      // 注册查询变化监听器 - 关键修复：在 setupShortcuts 中注册，确保只在客户端执行
      watch(
        () => searchInstance.query.value,
        (newQuery) => {
          debouncedSearch(newQuery)
        },
      )
    }
  }

  return {
    // 搜索状态
    isOpen: readonly(isOpen),
    ...searchInstance,

    // 控制方法
    open,
    close,
    toggle,
    setupShortcuts,
  }
}

// 客户端单例模式 - 服务端每次创建新实例
let globalSearchInstance: ReturnType<typeof useGlobalSearch> | null = null

export function useGlobalSearchInstance() {
  // 只在客户端使用单例，服务端每次创建新实例
  if (import.meta.client) {
    if (!globalSearchInstance) {
      globalSearchInstance = useGlobalSearch()
    }
    return globalSearchInstance
  }
  else {
    // 服务端每次创建新实例，避免状态污染
    return useGlobalSearch()
  }
}
