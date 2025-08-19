import type { SearchableItem } from '~/composables/useAdvancedSearch'
import { h } from 'vue'
import { useAdvancedSearch } from '~/composables/useAdvancedSearch'
import { useCommandPalette } from '~/composables/useCommandPalette'
import { useGlobalSearchInstance } from '~/composables/useGlobalSearch'
import { useMenuData } from '~/composables/useMenuData'

interface MenuItem {
  title: string
  icon?: string
  url?: string
  logo?: string
  description?: string
  deprecated?: boolean
  children?: MenuItem[]
  tags?: string[]
}

export default defineComponent({
  name: 'TheCommandPalette',
  setup() {
    const { commandActive, textCommand } = useCommandPalette()
    const { menuData, fetchMenuData } = useMenuData()
    const { isSearchModalOpen, searchQuery, openSearch, closeSearch, setupGlobalShortcuts } = useGlobalSearchInstance()

    // 初始化时获取菜单数据和设置快捷键
    onMounted(() => {
      fetchMenuData()
      setupGlobalShortcuts()
    })

    // 将menu压缩为一级并转换为SearchableItem格式
    const flattenedDocOptionsRef = computed(() => {
      const flattenedItems: SearchableItem[] = []
      const traverse = (items: MenuItem[]) => {
        if (!items)
          return
        items.forEach((item) => {
          if (item.children) {
            traverse(item.children)
          }
          else {
            flattenedItems.push({
              id: item.title,
              title: item.title,
              url: item.url,
              description: item.description,
              tags: item.tags,
              logo: item.logo,
              deprecated: item.deprecated,
            })
          }
        })
      }
      traverse(menuData.value)
      return flattenedItems
    })

    // 使用高级搜索，传入全局搜索查询
    const {
      searchResults,
      highlightedResults,
      isSearching,
    } = useAdvancedSearch(flattenedDocOptionsRef, {
      fields: ['title', 'description', 'tags'],
      threshold: 0.2,
      maxResults: 8,
      debounceMs: 200,
    }, searchQuery)

    // 搜索选项（用于自动完成组件）
    const searchOptions = computed(() => {
      return highlightedResults.value.map(result => ({
        label: result.title,
        value: result.title,
        data: result,
        highlightedLabel: result.displayTitle || result.title,
      }))
    })

    function handleSelect(value: string, option?: any) {
      closeSearch()

      // 优先使用option中的data，如果没有则从搜索结果中查找
      let result = option?.data
      if (!result) {
        result = highlightedResults.value.find(item => item.title === value)
      }

      if (result?.url) {
        // 打开外部链接
        window.open(result.url, '_blank')
      }
      else {
        // 滚动到对应元素（用于页面内导航）
        const element = document.getElementById(value)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }

    // 监听命令面板激活
    watch(commandActive, () => {
      openSearch()
    })

    // 监听搜索模态框状态
    watch(isSearchModalOpen, (isOpen) => {
      if (!isOpen) {
        searchQuery.value = ''
      }
    })
    return () => (
      <>
        <div class="flex items-center gap-1 flex-1">
          <n-button
            class="flex-1 flex justify-start items-center text-4"
            overflow="hidden"
            bg="#2e33380d"
            onClick={() => openSearch()}
          >
            <div class="flex items-center gap-1 text-gray-500 text-sm opacity-50">
              <i class="i-tabler-search text-4"></i>
              <span class="ml-2">搜索</span>
              <span class="ml-2 border border-current rounded px-[5px] border-solid sm:inline">
                {textCommand.value}
              </span>
            </div>
          </n-button>
          {isSearchModalOpen.value && (
            <n-modal
              display-directive="if"
              show={isSearchModalOpen.value}
              class="w-screen-md m-t-20"
              onAfterLeave={() => closeSearch()}
              onUpdateShow={(value: boolean) => {
                if (!value)
                  closeSearch()
              }}
            >
              <n-card content-style="padding:12px">
                <div class="space-y-3">
                  <n-auto-complete
                    v-model:value={searchQuery.value}
                    options={searchOptions.value}
                    size="large"
                    placeholder="搜索网站、标签或描述... (Ctrl+K / Cmd+K)"
                    clearable
                    loading={isSearching.value}
                    onSelect={(value: string, option: any) => handleSelect(value, option)}
                    autofocus
                    renderLabel={(option: any) => {
                      if (option.highlightedLabel && option.highlightedLabel !== option.label) {
                        return h('span', { innerHTML: option.highlightedLabel })
                      }
                      return option.label
                    }}
                  />
                  {searchResults.value.length > 0 && (
                    <div class="text-xs text-gray-500 px-1">
                      找到
                      {' '}
                      {searchResults.value.length}
                      {' '}
                      个结果
                    </div>
                  )}
                  <div class="text-xs text-gray-400 px-1 border-t pt-2">
                    <div class="flex gap-4">
                      <span>
                        <kbd class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd>
                        {' '}
                        打开
                      </span>
                      <span>
                        <kbd class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Esc</kbd>
                        {' '}
                        关闭
                      </span>
                      <span>
                        <kbd class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">↑↓</kbd>
                        {' '}
                        选择
                      </span>
                    </div>
                  </div>
                </div>
              </n-card>
            </n-modal>
          )}
        </div>
      </>
    )
  },
})
