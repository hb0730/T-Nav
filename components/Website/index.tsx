import { useGlobal } from '~/composables/useGlobal'
import { useLazyLoad } from '~/composables/useIntersectionObserver'
import { usePaginatedMenu } from '~/composables/usePaginatedMenu'
import ToolCard from '../ToolCard'

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

export default defineComponent({
  name: 'Website',
  props: {
    // 初始显示的分类数量
    initialCategoriesCount: {
      type: Number,
      default: 6,
    },
    // 服务端预取的初始数据
    initialData: {
      type: Object as PropType<{
        categories: MenuItem[]
        pagination: {
          page: number
          pageSize: number
          total: number
          totalPages: number
          hasNextPage: boolean
          hasPrevPage: boolean
        }
      } | null>,
      default: null,
    },
    // menu中的所有分类列表（确保锚点完整）
    allMenuCategories: {
      type: Array as PropType<{ title: string }[]>,
      default: () => [],
    },
  },

  setup(props) {
    const { isSmallScreen } = useGlobal()
    const { createLazyElement } = useLazyLoad()
    const {
      categories,
      pagination,
      isLoading,
      isLoadingMore,
      setInitialData,
      fetchInitialData,
      loadMoreCategories,
      expandCategoryLinks,
    } = usePaginatedMenu()

    // 分类展开/折叠状态
    const expandedCategories = ref<Set<string>>(new Set())
    // 每个分类初始显示的链接数量
    const initialLinksPerCategory = computed(() => isSmallScreen.value ? 4 : 8)
    // 已懒加载的分类
    const lazyLoadedCategories = ref<Set<string>>(new Set())

    // 立即初始化数据（SSR时就可用）
    if (props.initialData) {
      // 如果有服务端预取的数据，立即设置
      setInitialData(props.initialData)
    }

    // 客户端挂载时的数据获取
    onMounted(async () => {
      // 只有在没有初始数据时才客户端获取
      if (!props.initialData) {
        try {
          await fetchInitialData({
            pageSize: props.initialCategoriesCount,
            linksPerCategory: initialLinksPerCategory.value,
          })
        }
        catch (error) {
          console.error('初始化菜单数据失败:', error)
        }
      }
    })

    // 计算是否应该显示loading状态
    const shouldShowLoading = computed(() => {
      return isLoading.value && !props.initialData && categories.value.length === 0
    })

    // 获取分类下显示的链接
    const getCategoryLinks = (category: MenuItem) => {
      const validLinks = category.children?.filter(tool => !tool.deprecated) || []
      const categoryKey = category.id
      const isExpanded = expandedCategories.value.has(categoryKey)

      if (isExpanded || !category.hasMore || validLinks.length <= initialLinksPerCategory.value) {
        return validLinks
      }

      return validLinks.slice(0, initialLinksPerCategory.value)
    }

    // 切换分类展开状态
    const toggleCategoryExpansion = async (category: MenuItem) => {
      const categoryKey = category.id

      if (expandedCategories.value.has(categoryKey)) {
        expandedCategories.value.delete(categoryKey)
      }
      else {
        expandedCategories.value.add(categoryKey)
        // 如果有更多链接需要加载，则从API获取
        if (category.hasMore) {
          try {
            await expandCategoryLinks(category.id)
          }
          catch (error) {
            console.error('展开分类失败:', error)
            expandedCategories.value.delete(categoryKey)
          }
        }
      }
    }

    // 判断分类是否需要显示展开/收起按钮
    const needsExpansionButton = (category: MenuItem) => {
      return category.hasMore || category.totalLinks > initialLinksPerCategory.value
    }

    // 是否分类已展开
    const isCategoryExpanded = (categoryId: string) => {
      return expandedCategories.value.has(categoryId)
    }

    // 懒加载元素映射
    const lazyElements = new Map<string, ReturnType<typeof createLazyElement>>()

    // 创建或获取懒加载元素
    const getLazyElement = (categoryTitle: string) => {
      if (!lazyElements.has(categoryTitle)) {
        lazyElements.set(categoryTitle, createLazyElement())
      }
      return lazyElements.get(categoryTitle)!
    }

    // 渲染分类内容
    const renderCategoryContent = (item: MenuItem) => {
      const displayedLinks = getCategoryLinks(item)
      const isExpanded = isCategoryExpanded(item.id)
      const needsButton = needsExpansionButton(item)
      const validLinksCount = item.totalLinks

      return (
        <>
          <div class="flex items-center justify-between mb-4">
            <h3 class={['font-bold', isSmallScreen.value ? 'text-xl' : 'text-2xl']}>
              {item.title}
              <span class="ml-2 text-sm text-gray-500">
                (
                {validLinksCount}
                )
              </span>
            </h3>
            {needsButton && (
              <n-button
                text
                type="primary"
                size="small"
                onClick={() => toggleCategoryExpansion(item)}
                class="shrink-0"
              >
                {{
                  icon: () => h(resolveComponent('n-icon'), {}, {
                    default: () => h('i', {
                      class: isExpanded ? 'i-tabler-chevron-up' : 'i-tabler-chevron-down',
                    }),
                  }),
                  default: () => isExpanded ? '收起' : `查看全部 ${validLinksCount} 个`,
                }}
              </n-button>
            )}
          </div>

          <div class="grid grid-cols-1 gap-[12px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {displayedLinks.map(tool => (
              <ToolCard modelValue={tool} key={tool.title} />
            ))}
          </div>

          {/* 渐变遮罩效果 */}
          {needsButton && !isExpanded && (
            <div class="relative -mt-12 h-12 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
          )}
        </>
      )
    }

    // 创建分类组件
    const createCategoryComponent = (item: MenuItem, index: number) => {
      // 前3个分类立即加载，其余的懒加载
      if (index < 3) {
        lazyLoadedCategories.value.add(item.title)
        return (
          <div id={item.title} key={item.title} class="m-b-17">
            {renderCategoryContent(item)}
          </div>
        )
      }

      // 懒加载组件
      const lazyElement = getLazyElement(item.title)

      return (
        <div
          ref={lazyElement.elementRef}
          id={item.title}
          key={item.title}
          class="m-b-17"
          // Vue 3 生命周期钩子
          {...{
            onVnodeMounted: () => {
              lazyElement.startObserving(() => {
                lazyLoadedCategories.value.add(item.title)
              })
            },
            onVnodeUnmounted: () => {
              lazyElement.cleanup()
            },
          }}
        >
          {lazyElement.isLoaded.value
            ? renderCategoryContent(item)
            : (
              /* 骨架屏 */
                <div class="animate-pulse">
                  <div class="flex items-center justify-between mb-4">
                    <div class="h-7 bg-gray-200 rounded w-32"></div>
                    <div class="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div class="grid grid-cols-1 gap-[12px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: initialLinksPerCategory.value }).map((_, idx) => (
                      <div key={idx} class="bg-gray-200 rounded-lg h-24"></div>
                    ))}
                  </div>
                </div>
              )}
        </div>
      )
    }

    // 获取所有应该显示的分类标题（已加载的 + menu中尚未加载的）
    const getAllCategoryTitles = () => {
      const loadedTitles = new Set(categories.value.map(cat => cat.title))
      const allTitles = [...loadedTitles]

      // 添加menu中还未加载的分类
      props.allMenuCategories.forEach((menuCat) => {
        if (!loadedTitles.has(menuCat.title)) {
          allTitles.push(menuCat.title)
        }
      })

      return allTitles
    }

    return () => (
      <>
        {/* 为所有menu分类提供锚点，确保跳转始终有效 */}
        {getAllCategoryTitles().map((categoryTitle) => {
          const loadedCategory = categories.value.find(cat => cat.title === categoryTitle)

          if (loadedCategory) {
            // 如果分类已加载，显示完整内容
            const index = categories.value.indexOf(loadedCategory)
            return createCategoryComponent(loadedCategory as MenuItem, index)
          }
          else {
            // 如果分类未加载，显示占位锚点（在加载状态下）
            return shouldShowLoading.value ? (
              <div key={categoryTitle} id={categoryTitle} class="animate-pulse">
                <div class="flex items-center justify-between mb-4">
                  <div class="h-7 bg-gray-200 rounded w-32"></div>
                  <div class="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div class="grid grid-cols-1 gap-[12px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: initialLinksPerCategory.value }).map((_, idx) => (
                    <div key={idx} class="bg-gray-200 rounded-lg h-24"></div>
                  ))}
                </div>
              </div>
            ) : (
              // 非加载状态下只提供空的锚点
              <div key={categoryTitle} id={categoryTitle} style="height: 0; visibility: hidden;" />
            )
          }
        })}

        {/* 加载更多分类按钮 */}
        {!shouldShowLoading.value && pagination.value.hasNextPage && (
          <div class="text-center mt-8 mb-6">
            <n-button
              type="primary"
              ghost
              size="large"
              loading={isLoadingMore.value}
              onClick={loadMoreCategories}
            >
              {{
                icon: () => h(resolveComponent('n-icon'), {}, {
                  default: () => h('i', { class: 'i-tabler-chevron-down' }),
                }),
                default: () => `加载更多分类 (${pagination.value.total - categories.value.length} 个未显示)`,
              }}
            </n-button>
          </div>
        )}

        {/* 全部加载完成提示 */}
        {!shouldShowLoading.value && !pagination.value.hasNextPage && pagination.value.total > props.initialCategoriesCount && (
          <div class="text-center mt-8 mb-6 text-gray-500 text-sm">
            <i class="i-tabler-check mr-1" />
            已显示全部
            {' '}
            {pagination.value.total}
            {' '}
            个分类
          </div>
        )}
      </>
    )
  },
})
