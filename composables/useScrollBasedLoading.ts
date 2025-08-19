interface CategoryPlaceholder {
  id: string
  title: string
  icon?: string
  estimatedHeight: number
  isLoaded: boolean
  isLoading: boolean
  data?: any
}

interface ScrollLoadingOptions {
  allCategories: { title: string, icon?: string }[]
  preloadedCategories?: any[] // SSR预加载的分类数据
  loadThreshold: number // 距离可视区域多少像素开始加载
  estimatedCategoryHeight: number // 预估的分类高度
  initialLoadCount?: number // 初始预加载的分类数量
}

/**
 * 基于滚动位置的分类懒加载
 */
export function useScrollBasedLoading(options: ScrollLoadingOptions) {
  const {
    allCategories,
    preloadedCategories = [],
    loadThreshold = 800, // 增加到800px，提前更多触发加载
    estimatedCategoryHeight = 400,
    initialLoadCount = 0, // 不再额外加载，依赖预加载数据
  } = options

  // 所有分类的占位信息
  const categoryPlaceholders = ref<CategoryPlaceholder[]>(
    allCategories.map((cat) => {
      // 检查是否有预加载的数据
      const preloadedData = preloadedCategories.find(p => p.title === cat.title)
      return {
        id: cat.title,
        title: cat.title,
        icon: cat.icon,
        estimatedHeight: estimatedCategoryHeight,
        isLoaded: !!preloadedData,
        isLoading: false,
        data: preloadedData || null,
      }
    }),
  )

  // 已加载的分类数据（包含预加载的数据）
  const loadedCategories = ref<Map<string, any>>(new Map())

  // 将预加载的数据添加到已加载的分类中
  preloadedCategories.forEach((category) => {
    loadedCategories.value.set(category.title, category)
  })

  // 滚动容器引用
  const scrollContainerRef = ref<HTMLElement>()

  // 加载特定分类的数据
  const loadCategoryData = async (categoryTitle: string) => {
    const placeholder = categoryPlaceholders.value.find(p => p.title === categoryTitle)
    if (!placeholder || placeholder.isLoaded || placeholder.isLoading) {
      return
    }

    placeholder.isLoading = true
    try {
      // 编码分类标题以正确处理中文字符
      const encodedTitle = encodeURIComponent(categoryTitle)
      const { data } = await $fetch<{ success: boolean, data: any }>(`/api/categories/${encodedTitle}/details`)

      placeholder.data = data
      placeholder.isLoaded = true
      loadedCategories.value.set(categoryTitle, data)
    }
    catch (error) {
      console.error(`加载分类 ${categoryTitle} 失败:`, error)
    }
    finally {
      placeholder.isLoading = false
    }
  }

  // 检查哪些分类需要加载
  const checkVisibleCategories = () => {
    if (!scrollContainerRef.value)
      return

    const container = scrollContainerRef.value
    const containerRect = container.getBoundingClientRect()
    const scrollTop = container.scrollTop
    const viewportHeight = containerRect.height

    let currentTop = 0
    const categoriesToLoad: string[] = []

    categoryPlaceholders.value.forEach((placeholder) => {
      const categoryBottom = currentTop + placeholder.estimatedHeight
      const isInLoadingZone = (
        categoryBottom >= scrollTop - loadThreshold
        && currentTop <= scrollTop + viewportHeight + loadThreshold
      )

      if (isInLoadingZone && !placeholder.isLoaded && !placeholder.isLoading) {
        categoriesToLoad.push(placeholder.title)
      }

      currentTop = categoryBottom
    })

    // 并行加载多个分类
    categoriesToLoad.forEach((title) => {
      loadCategoryData(title)
    })
  }

  // 滚动事件处理 - 减少节流时间，更快响应
  const handleScroll = throttle(checkVisibleCategories, 16) // 约60fps，更快响应

  // 滚动到指定分类
  const scrollToCategory = (categoryTitle: string) => {
    if (!scrollContainerRef.value)
      return

    let targetTop = 0
    const targetIndex = categoryPlaceholders.value.findIndex(p => p.title === categoryTitle)

    if (targetIndex === -1)
      return

    // 计算目标位置
    for (let i = 0; i < targetIndex; i++) {
      targetTop += categoryPlaceholders.value[i].estimatedHeight
    }

    // 滚动到目标位置
    scrollContainerRef.value.scrollTo({
      top: targetTop - (document.getElementById('navbar')?.offsetHeight ?? 0),
      behavior: 'smooth',
    })

    // 立即加载目标分类（如果还未加载）
    const targetPlaceholder = categoryPlaceholders.value[targetIndex]
    if (!targetPlaceholder.isLoaded && !targetPlaceholder.isLoading) {
      loadCategoryData(categoryTitle)
    }
  }

  // 初始化
  const initScrollLoading = () => {
    if (scrollContainerRef.value) {
      scrollContainerRef.value.addEventListener('scroll', handleScroll)

      // 立即检查可视区域并预加载
      nextTick(() => {
        // 检查可视区域，加载需要的分类
        checkVisibleCategories()

        // 额外预加载接下来的2个分类（积极预加载策略）
        setTimeout(() => {
          const preloadNext = 2
          let loaded = 0
          for (const placeholder of categoryPlaceholders.value) {
            if (!placeholder.isLoaded && !placeholder.isLoading && loaded < preloadNext) {
              loadCategoryData(placeholder.title)
              loaded++
            }
          }
        }, 100) // 延迟100ms，避免阻塞主渲染
      })
    }
  }

  // 清理
  const cleanup = () => {
    if (scrollContainerRef.value) {
      scrollContainerRef.value.removeEventListener('scroll', handleScroll)
    }
  }

  // 计算分类的实际位置
  const getCategoryPosition = (categoryTitle: string) => {
    let position = 0
    const targetIndex = categoryPlaceholders.value.findIndex(p => p.title === categoryTitle)

    for (let i = 0; i < targetIndex; i++) {
      position += categoryPlaceholders.value[i].estimatedHeight
    }

    return position
  }

  return {
    categoryPlaceholders: readonly(categoryPlaceholders),
    loadedCategories: readonly(loadedCategories),
    scrollContainerRef,
    scrollToCategory,
    loadCategoryData,
    initScrollLoading,
    cleanup,
    getCategoryPosition,
  }
}

// 节流函数
function throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout | null = null
  let lastExecTime = 0

  return ((...args: any[]) => {
    const currentTime = Date.now()

    if (currentTime - lastExecTime > delay) {
      func(...args)
      lastExecTime = currentTime
    }
    else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        func(...args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }) as T
}
