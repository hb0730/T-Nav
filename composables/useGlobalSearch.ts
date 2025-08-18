import { ref, onMounted, onUnmounted } from 'vue'
import { useEventListener } from '@vueuse/core'

/**
 * 全局搜索状态管理
 */
export function useGlobalSearch() {
  const isSearchModalOpen = ref(false)
  const searchQuery = ref('')

  // 打开搜索模态框
  function openSearch() {
    isSearchModalOpen.value = true
  }

  // 关闭搜索模态框
  function closeSearch() {
    isSearchModalOpen.value = false
    searchQuery.value = ''
  }

  // 切换搜索模态框
  function toggleSearch() {
    if (isSearchModalOpen.value) {
      closeSearch()
    } else {
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
      if (!isSearchModalOpen.value && 
          !event.ctrlKey && 
          !event.metaKey && 
          !event.altKey &&
          event.key.length === 1 &&
          event.key.match(/[a-zA-Z0-9\u4e00-\u9fa5]/)) {
        const activeElement = document.activeElement
        const isInputActive = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).contentEditable === 'true'
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
        document.title = '🔍 搜索中... - ' + originalTitle
      } else {
        document.title = originalTitle
      }
    }
  }

  return {
    isSearchModalOpen: readonly(isSearchModalOpen),
    searchQuery,
    openSearch,
    closeSearch,
    toggleSearch,
    setupGlobalShortcuts,
    updatePageTitle,
  }
}

// 全局单例
let globalSearchInstance: ReturnType<typeof useGlobalSearch> | null = null

/**
 * 获取全局搜索实例（单例模式）
 */
export function useGlobalSearchInstance() {
  if (!globalSearchInstance) {
    globalSearchInstance = useGlobalSearch()
  }
  return globalSearchInstance
}