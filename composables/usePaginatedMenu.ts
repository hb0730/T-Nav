interface MenuItem {
  id: string
  title: string
  icon?: string
  totalLinks: number
  hasMore: boolean
  children: {
    title: string
    url: string
    logo?: string
    description?: string
    tags: string[]
    deprecated: boolean
  }[]
}

interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface MenuResponse {
  categories: MenuItem[]
  pagination: PaginationInfo
}

/**
 * 分页菜单数据管理
 */
export function usePaginatedMenu() {
  const categories = ref<MenuItem[]>([])
  const pagination = ref<PaginationInfo>({
    page: 1,
    pageSize: 6,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const isLoading = ref(false)
  const isLoadingMore = ref(false)

  // 设置初始数据（用于SSR预取的数据）
  const setInitialData = (data: MenuResponse) => {
    // 深克隆以避免readonly类型问题
    categories.value = JSON.parse(JSON.stringify(data.categories))
    pagination.value = { ...data.pagination }
  }

  // 获取初始数据
  const fetchInitialData = async (options?: {
    pageSize?: number
    linksPerCategory?: number
  }) => {
    isLoading.value = true
    try {
      const { data } = await $fetch<{ success: boolean, data: MenuResponse }>('/api/menu/paginated', {
        query: {
          page: 1,
          pageSize: options?.pageSize || 6,
          linksPerCategory: options?.linksPerCategory || 8,
        },
      })

      categories.value = data.categories
      pagination.value = data.pagination
    }
    catch (error) {
      console.error('获取菜单数据失败:', error)
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  // 加载更多分类
  const loadMoreCategories = async () => {
    if (!pagination.value.hasNextPage || isLoadingMore.value)
      return

    isLoadingMore.value = true
    try {
      const nextPage = pagination.value.page + 1
      const { data } = await $fetch<{ success: boolean, data: MenuResponse }>('/api/menu/paginated', {
        query: {
          page: nextPage,
          pageSize: pagination.value.pageSize,
          linksPerCategory: 8,
        },
      })

      // 追加新的分类
      categories.value.push(...data.categories)
      pagination.value = data.pagination
    }
    catch (error) {
      console.error('加载更多分类失败:', error)
      throw error
    }
    finally {
      isLoadingMore.value = false
    }
  }

  // 展开分类的完整链接
  const expandCategoryLinks = async (categoryId: string) => {
    try {
      const { data } = await $fetch<{
        success: boolean
        data: {
          category: { id: string, title: string, icon?: string, totalLinks: number }
          links: MenuItem['children']
          pagination: PaginationInfo
        }
      }>(`/api/categories/${categoryId}/links`)

      // 找到对应的分类并更新其链接
      const categoryIndex = categories.value.findIndex(cat => cat.id === categoryId)
      if (categoryIndex !== -1 && categories.value[categoryIndex]) {
        categories.value[categoryIndex]!.children = data.links
        categories.value[categoryIndex]!.hasMore = false
      }

      return data.links
    }
    catch (error) {
      console.error('展开分类链接失败:', error)
      throw error
    }
  }

  // 重置数据
  const reset = () => {
    categories.value = []
    pagination.value = {
      page: 1,
      pageSize: 6,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    }
  }

  return {
    categories: readonly(categories),
    pagination: readonly(pagination),
    isLoading: readonly(isLoading),
    isLoadingMore: readonly(isLoadingMore),
    setInitialData,
    fetchInitialData,
    loadMoreCategories,
    expandCategoryLinks,
    reset,
  }
}
