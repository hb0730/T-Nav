import type { SearchableLink } from '~/composables/useOptimizedSearch'
import { useCommandPalette } from '~/composables/useCommandPalette'
import { useOptimizedGlobalSearchInstance } from '~/composables/useOptimizedGlobalSearch'
import TheIcon from '../TheIcon'

export default defineComponent({
  name: 'TheCommandPalette',
  setup() {
    const { commandActive, textCommand } = useCommandPalette()
    const {
      isSearchModalOpen,
      searchQuery,
      searchResults,
      highlightedResults,
      isSearching,
      openSearch,
      closeSearch,
      setupGlobalShortcuts,
    } = useOptimizedGlobalSearchInstance()

    // 初始化时设置快捷键
    onMounted(() => {
      setupGlobalShortcuts()
    })

    function handleSelect(value: string, option?: any) {
      closeSearch()

      // 优先使用option中的data，如果没有则从搜索结果中查找
      let result: SearchableLink | undefined = option?.data
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
                  <n-input
                    v-model:value={searchQuery.value}
                    size="large"
                    placeholder="搜索网站、标签或描述... (Ctrl+K / Cmd+K)"
                    clearable
                    loading={isSearching.value}
                    autofocus
                    onKeydown={(e: KeyboardEvent) => {
                      if (e.key === 'Enter' && searchResults.value.length > 0) {
                        const firstResult = searchResults.value[0]
                        if (firstResult) {
                          handleSelect(firstResult.title, { data: firstResult })
                        }
                      }
                    }}
                  >
                    {{
                      prefix: () => <i class="i-tabler-search text-4"></i>,
                    }}
                  </n-input>

                  {/* 搜索结果列表 */}
                  {searchResults.value.length > 0 && (
                    <div class="max-h-80 overflow-y-auto space-y-1">
                      <div class="text-xs text-gray-500 px-2 py-1 border-b border-gray-100 dark:border-gray-700">
                        找到
                        {' '}
                        {searchResults.value.length}
                        {' '}
                        个结果
                      </div>
                      {searchResults.value.slice(0, 8).map(result => (
                        <div
                          key={result.id}
                          class="px-2 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                          onClick={() => handleSelect(result.title, { data: result })}
                        >
                          <div class="flex items-center gap-3">
                            {/* Logo */}
                            <div class="flex-shrink-0">
                              {result.logo && !result.logo.startsWith('http')
                                ? (
                                    <TheIcon icon={result.logo} class="w-5 h-5" />
                                  )
                                : result.logo
                                  ? (
                                      <img src={result.logo} alt={result.title} class="w-5 h-5 object-contain" />
                                    )
                                  : (
                                      <i class="i-tabler-link text-gray-400 text-5"></i>
                                    )}
                            </div>

                            {/* 内容 */}
                            <div class="flex-1 min-w-0">
                              <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                <span innerHTML={(result as any).highlightedTitle || result.title}></span>
                              </div>
                              {result.description && (
                                <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  <span innerHTML={(result as any).highlightedDescription || result.description}></span>
                                </div>
                              )}

                              {/* 分类和标签 */}
                              <div class="flex items-center gap-2 mt-1">
                                {result.category && (
                                  <span class="text-xs text-blue-600 dark:text-blue-400">
                                    {result.category.title}
                                  </span>
                                )}
                                {result.tags.length > 0 && (
                                  <div class="flex gap-1">
                                    {result.tags.slice(0, 2).map(tag => (
                                      <span key={tag} class="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">
                                        {tag}
                                      </span>
                                    ))}
                                    {result.tags.length > 2 && (
                                      <span class="text-xs text-gray-400">
                                        +
                                        {result.tags.length - 2}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 无结果状态 */}
                  {searchQuery.value && !isSearching.value && searchResults.value.length === 0 && (
                    <div class="text-center py-8 text-gray-500">
                      <i class="i-tabler-search-off text-8 mb-2 block"></i>
                      <div class="text-sm">未找到相关结果</div>
                      <div class="text-xs mt-1">尝试使用不同的关键词</div>
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
