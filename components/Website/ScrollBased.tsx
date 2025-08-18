import { useGlobal } from '~/composables/useGlobal'
import { useScrollBasedLoading } from '~/composables/useScrollBasedLoading'
import ToolCard from '../ToolCard'

interface MenuItem {
  id: string
  title: string
  icon?: string
  totalLinks: number
  hasMore?: boolean
  links: {
    title: string
    url: string
    logo?: string
    description?: string
    tags: string[]
    deprecated: boolean
  }[]
}

interface CategoryInfo {
  title: string
  icon?: string
}

export default defineComponent({
  name: 'WebsiteScrollBased',
  props: {
    allMenuCategories: {
      type: Array as PropType<CategoryInfo[]>,
      default: () => [],
    },
    preloadedCategories: {
      type: Array as PropType<MenuItem[]>,
      default: () => [],
    },
    estimatedCategoryHeight: {
      type: Number,
      default: 400,
    },
    loadThreshold: {
      type: Number,
      default: 1000,
    },
  },

  setup(props) {
    const { isSmallScreen } = useGlobal()

    const {
      categoryPlaceholders,
      loadedCategories,
      scrollContainerRef,
      scrollToCategory,
      initScrollLoading,
      cleanup,
    } = useScrollBasedLoading({
      allCategories: props.allMenuCategories,
      preloadedCategories: props.preloadedCategories,
      loadThreshold: props.loadThreshold,
      estimatedCategoryHeight: props.estimatedCategoryHeight,
    })

    // 首页每个分类固定显示的链接数量
    const fixedLinksPerCategory = computed(() => isSmallScreen.value ? 4 : 8)

    // 获取分类下显示的链接（首页固定显示数量）
    const getCategoryLinks = (category: MenuItem) => {
      const validLinks = category.links?.filter(tool => !tool.deprecated) || []
      return validLinks.slice(0, fixedLinksPerCategory.value)
    }

    // 渲染分类内容
    const renderCategoryContent = (item: MenuItem) => {
      const displayedLinks = getCategoryLinks(item)
      const validLinksCount = item.totalLinks
      const hasMore = validLinksCount > fixedLinksPerCategory.value

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
            {hasMore && (
              <n-button
                text
                type="primary"
                size="small"
                tag="a"
                href={`/category/${encodeURIComponent(item.title)}`}
                class="shrink-0"
              >
                {{
                  icon: () => h(resolveComponent('n-icon'), {}, {
                    default: () => h('i', {
                      class: 'i-tabler-external-link',
                    }),
                  }),
                  default: () => '查看全部',
                }}
              </n-button>
            )}
          </div>

          <div class="grid grid-cols-1 gap-[12px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {displayedLinks.map(tool => (
              <ToolCard modelValue={tool} key={tool.title} />
            ))}
          </div>
        </>
      )
    }

    // 渲染单个分类
    const renderCategory = (placeholder: any) => {
      const loadedData = loadedCategories.value.get(placeholder.title)

      return (
        <div
          id={placeholder.title}
          key={placeholder.title}
          class="category-section"
          style={`min-height: ${placeholder.estimatedHeight}px;`}
        >
          {loadedData
            ? (
          // 已加载：显示完整内容
                <div class="m-b-17">
                  {renderCategoryContent(loadedData)}
                </div>
              )
            : placeholder.isLoading
              ? (
            // 加载中：显示骨架屏
                  <div class="m-b-17 animate-pulse">
                    <div class="flex items-center justify-between mb-4">
                      <div class="h-7 bg-gray-200 rounded w-32"></div>
                      <div class="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div class="grid grid-cols-1 gap-[12px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {Array.from({ length: fixedLinksPerCategory.value }).map((_, idx) => (
                        <div key={idx} class="bg-gray-200 rounded-lg h-24"></div>
                      ))}
                    </div>
                  </div>
                )
              : (
            // 未加载：显示轻量级占位区域
                  <div class="m-b-17 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors" style={`height: ${placeholder.estimatedHeight}px;`}>
                    <div class="text-center text-gray-400">
                      <i class={`${placeholder.icon || 'i-tabler-layout-grid-filled'} text-4xl mb-2 text-gray-300`} />
                      <div class="text-base font-medium text-gray-500">{placeholder.title}</div>
                      <div class="text-xs text-gray-400 mt-1">即将加载...</div>
                    </div>
                  </div>
                )}
        </div>
      )
    }

    // 生命周期
    onMounted(() => {
      // 由于组件不是滚动容器，需要监听父级滚动容器
      const contentElement = document.getElementsByClassName('c-content')[0]?.firstElementChild as HTMLElement
      if (contentElement) {
        scrollContainerRef.value = contentElement
        initScrollLoading()
      }
    })

    onUnmounted(() => {
      cleanup()
    })

    // 暴露scrollToCategory方法供TheMenu使用
    provide('scrollToCategory', scrollToCategory)

    return () => (
      <div>
        {categoryPlaceholders.value.map(placeholder => renderCategory(placeholder))}
      </div>
    )
  },
})
