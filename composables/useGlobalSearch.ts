import { useEventListener } from '@vueuse/core'
import { useSearch } from './useSearch'

/**
 * 全局搜索状态管理 - 简化版本
 */
export function useGlobalSearch() {
  const isOpen = ref(false)
  
  // 使用简化的搜索功能，禁用历史记录
  const search = useSearch({
    debounce: 300,
    pageSize: 20,
    enableHistory: false,
    enableCache: true,
  })

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
  }

  return {
    // 搜索状态
    isOpen: readonly(isOpen),
    ...search,

    // 控制方法
    open,
    close,
    toggle,
    setupShortcuts,
  }
}

// 全局单例
let globalSearch: ReturnType<typeof useGlobalSearch> | null = null

export function useGlobalSearchInstance() {
  if (!globalSearch) {
    globalSearch = useGlobalSearch()
  }
  return globalSearch
}