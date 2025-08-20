import { useEventListener } from '@vueuse/core'
import { readonly, ref } from 'vue'
import { useOptimizedSearch } from './useOptimizedSearch'

/**
 * 优化的全局搜索状态管理
 */
export function useOptimizedGlobalSearch() {
  const isSearchModalOpen = ref(false)

  // 使用优化的搜索功能（禁用搜索历史以简化全局搜索）
  const {
    searchQuery,
    searchResults,
    highlightedResults,
    isSearching,
    searchStats,
    searchNow,
    loadMore,
    clearResults,
  } = useOptimizedSearch({
    pageSize: 20,
    debounceMs: 300,
    enableCache: true,
    autoSearch: true,
    enableHistory: false, // 全局搜索不需要历史记录
  })

  // 打开搜索模态框
  function openSearch() {
    isSearchModalOpen.value = true
  }

  // 关闭搜索模态框
  function closeSearch() {
    isSearchModalOpen.value = false
    // 不清空搜索查询，保持用户输入
  }

  // 切换搜索模态框
  function toggleSearch() {
    if (isSearchModalOpen.value) {
      closeSearch()
    }
    else {
      openSearch()
    }
  }

  // 监听全局快捷键
  function setupGlobalShortcuts() {
    const handleKeydown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K 或 Ctrl/Cmd + / 打开搜索
      if ((event.ctrlKey || event.metaKey) && (event.key === 'k' || event.key === '/')) {
        event.preventDefault()
        openSearch()
        return
      }

      // ESC 键关闭搜索
      if (event.key === 'Escape' && isSearchModalOpen.value) {
        event.preventDefault()
        closeSearch()
        return
      }

      // 当没有输入框聚焦时，直接输入字符也可以打开搜索
      if (!isSearchModalOpen.value
        && !event.ctrlKey
        && !event.metaKey
        && !event.altKey
        && event.key.length === 1
        && event.key.match(/[a-z0-9\u4E00-\u9FA5]/i)) {
        const activeElement = document.activeElement
        const isInputActive = activeElement && (
          activeElement.tagName === 'INPUT'
          || activeElement.tagName === 'TEXTAREA'
          || (activeElement as HTMLElement).contentEditable === 'true'
        )

        if (!isInputActive) {
          event.preventDefault()
          searchQuery.value = event.key
          openSearch()
        }
      }
    }

    // 注册全局键盘事件
    useEventListener(document, 'keydown', handleKeydown)
  }

  // 设置页面标题提示
  function updatePageTitle() {
    const originalTitle = document.title

    return () => {
      if (isSearchModalOpen.value) {
        document.title = `🔍 搜索中... - ${originalTitle}`
      }
      else {
        document.title = originalTitle
      }
    }
  }

  return {
    // 状态
    isSearchModalOpen: readonly(isSearchModalOpen),
    searchQuery,
    searchResults,
    highlightedResults,
    isSearching,
    searchStats,

    // 搜索方法
    searchNow,
    loadMore,
    clearResults,

    // 模态框控制方法
    openSearch,
    closeSearch,
    toggleSearch,
    setupGlobalShortcuts,
    updatePageTitle,
  }
}

// 全局单例
let globalSearchInstance: ReturnType<typeof useOptimizedGlobalSearch> | null = null

/**
 * 获取优化的全局搜索实例（单例模式）
 */
export function useOptimizedGlobalSearchInstance() {
  if (!globalSearchInstance) {
    globalSearchInstance = useOptimizedGlobalSearch()
  }
  return globalSearchInstance
}
