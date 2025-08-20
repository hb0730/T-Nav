<script setup lang="ts">
import type { SearchableLink } from '~/composables/useOptimizedSearch'
import { computed, nextTick, ref, watch } from 'vue'
import { useOptimizedSearch } from '~/composables/useOptimizedSearch'

interface Props {
  placeholder?: string
  size?: 'small' | 'medium' | 'large'
  maxDisplayResults?: number
  showAdvancedButton?: boolean
  pageSize?: number
  autoFocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索链接、标签、描述...',
  size: 'medium',
  maxDisplayResults: 8,
  showAdvancedButton: true,
  pageSize: 20,
  autoFocus: false,
})

const emit = defineEmits<{
  select: [result: SearchableLink]
  search: [query: string, results: SearchableLink[]]
}>()

// 搜索相关状态
const {
  searchQuery,
  searchResults,
  highlightedResults,
  pagination,
  isSearching,
  searchHistory,
  searchStats,
  searchNow,
  loadMore,
  clearHistory,
  clearResults,
} = useOptimizedSearch({
  pageSize: props.pageSize,
  debounceMs: 300,
  enableCache: true,
  autoSearch: true,
})

// UI 状态
const showDropdown = ref(false)
const showAdvanced = ref(false)
const selectedIndex = ref(-1)
const searchInputRef = ref()

// 高级搜索选项
const enabledFields = ref({
  title: true,
  description: true,
  tags: true,
  url: false,
})

// 显示的搜索结果（限制数量）
const displayResults = computed(() => {
  return highlightedResults.value.slice(0, props.maxDisplayResults)
})

// 显示的搜索历史
const displayHistory = computed(() => {
  return searchHistory.value.slice(0, 8)
})

// 监听搜索结果变化
watch([searchQuery, searchResults], ([query, results]) => {
  emit('search', query, [...results])
})

// 监听自动聚焦
watch(() => props.autoFocus, (autoFocus) => {
  if (autoFocus) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
}, { immediate: true })

// 切换高级搜索
function toggleAdvancedSearch() {
  showAdvanced.value = !showAdvanced.value
}

// 处理输入框获得焦点
function handleFocus() {
  showDropdown.value = true
  selectedIndex.value = -1
}

// 处理失去焦点
function handleBlur() {
  // 延迟隐藏下拉菜单，让点击事件先执行
  setTimeout(() => {
    showDropdown.value = false
    selectedIndex.value = -1
  }, 200)
}

// 处理键盘事件
function handleKeydown(event: KeyboardEvent) {
  const resultsCount = displayResults.value.length
  const historyCount = searchQuery.value ? 0 : displayHistory.value.length
  const totalCount = resultsCount + historyCount

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, totalCount - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0) {
        if (resultsCount > 0 && selectedIndex.value < resultsCount) {
          const selectedResult = displayResults.value[selectedIndex.value]
          if (selectedResult) {
            selectResult(selectedResult)
          }
        }
        else if (historyCount > 0) {
          const historyIndex = selectedIndex.value - resultsCount
          const selectedHistory = displayHistory.value[historyIndex]
          if (selectedHistory) {
            selectHistory(selectedHistory)
          }
        }
      }
      break
    case 'Escape':
      showDropdown.value = false
      searchInputRef.value?.blur()
      break
  }
}

// 选择搜索结果
function selectResult(result: SearchableLink) {
  emit('select', result)
  showDropdown.value = false
  selectedIndex.value = -1
}

// 选择搜索历史
function selectHistory(query: string) {
  searchQuery.value = query
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

// 加载更多结果
async function handleLoadMore() {
  try {
    await loadMore()
  }
  catch (error) {
    console.error('加载更多结果失败:', error)
  }
}

// 清空搜索
function handleClearSearch() {
  clearResults()
  searchInputRef.value?.focus()
}

// 暴露方法
defineExpose({
  focus: () => searchInputRef.value?.focus(),
  clear: handleClearSearch,
  searchNow: (query: string) => searchNow(query),
})
</script>

<template>
  <div class="optimized-search-container">
    <!-- 搜索输入框 -->
    <div class="relative">
      <n-input-group>
        <n-input
          ref="searchInputRef"
          v-model:value="searchQuery"
          :placeholder="placeholder"
          :size="size"
          clearable
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
        >
          <template #prefix>
            <n-icon :size="18">
              <i class="i-tabler-search" />
            </n-icon>
          </template>
        </n-input>
        <n-button
          v-if="showAdvancedButton"
          type="primary"
          ghost
          :loading="isSearching"
          @click="toggleAdvancedSearch"
        >
          <template #icon>
            <i class="i-tabler-adjustments" />
          </template>
          {{ showAdvanced ? '简单' : '高级' }}
        </n-button>
      </n-input-group>

      <!-- 下拉搜索结果 -->
      <div
        v-if="showDropdown && (searchResults.length > 0 || searchHistory.length > 0 || isSearching)"
        class="search-dropdown absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto"
      >
        <!-- 加载状态 -->
        <div v-if="isSearching" class="p-4 text-center text-gray-500">
          <n-spin size="small" />
          <span class="ml-2">搜索中...</span>
        </div>

        <!-- 搜索结果 -->
        <div v-else-if="searchResults.length > 0" class="py-2">
          <div class="px-3 py-1 text-xs text-gray-500 font-medium border-b border-gray-100 dark:border-gray-700">
            {{ searchStats.resultsText }}
          </div>

          <div
            v-for="(result, index) in displayResults"
            :key="result.id"
            class="px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            :class="[
              index === selectedIndex && 'bg-blue-50 dark:bg-blue-900',
            ]"
            @click="selectResult(result)"
            @mouseenter="selectedIndex = index"
          >
            <div class="flex items-center gap-3">
              <!-- 图标或Logo -->
              <div class="flex-shrink-0">
                <TheIcon
                  v-if="result.logo && !result.logo.startsWith('http')"
                  :icon="result.logo"
                  class="w-5 h-5"
                />
                <img
                  v-else-if="result.logo"
                  :src="result.logo"
                  :alt="result.title"
                  class="w-5 h-5 object-contain"
                >
                <n-icon v-else :size="20" class="text-gray-400">
                  <i class="i-tabler-link" />
                </n-icon>
              </div>

              <!-- 内容 -->
              <div class="flex-1 min-w-0">
                <div
                  class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                  v-html="(result as any).highlightedTitle || result.title"
                />
                <div
                  v-if="(result as any).highlightedDescription || result.description"
                  class="text-xs text-gray-500 dark:text-gray-400 truncate mt-1"
                  v-html="(result as any).highlightedDescription || result.description"
                />

                <!-- 分类信息 -->
                <div v-if="result.category" class="flex items-center gap-1 mt-1">
                  <n-icon :size="12" class="text-gray-400">
                    <i :class="result.category.icon || 'i-tabler-folder'" />
                  </n-icon>
                  <span class="text-xs text-gray-400">{{ result.category.title }}</span>
                </div>

                <!-- 标签 -->
                <div v-if="result.tags && result.tags.length > 0" class="flex flex-wrap gap-1 mt-1">
                  <n-tag
                    v-for="(tag, tagIndex) in result.tags.slice(0, 3)"
                    :key="tagIndex"
                    size="small"
                    class="text-xs"
                  >
                    <span v-html="(result as any).highlightedTags?.[tagIndex] || tag" />
                  </n-tag>
                  <span v-if="result.tags.length > 3" class="text-xs text-gray-400">
                    +{{ result.tags.length - 3 }}
                  </span>
                </div>
              </div>

              <!-- 外部链接图标 -->
              <div class="flex-shrink-0">
                <n-icon :size="14" class="text-gray-400">
                  <i class="i-tabler-external-link" />
                </n-icon>
              </div>
            </div>
          </div>

          <!-- 更多结果提示 -->
          <div
            v-if="searchResults.length > maxDisplayResults"
            class="px-3 py-2 text-xs text-gray-500 text-center border-t border-gray-100 dark:border-gray-700"
          >
            还有 {{ searchResults.length - maxDisplayResults }} 个结果
          </div>

          <!-- 加载更多按钮 -->
          <div
            v-if="pagination.hasNextPage"
            class="px-3 py-2 border-t border-gray-100 dark:border-gray-700"
          >
            <n-button
              text
              size="small"
              class="w-full"
              :loading="isSearching"
              @click="handleLoadMore"
            >
              <template #icon>
                <i class="i-tabler-chevron-down" />
              </template>
              加载更多
            </n-button>
          </div>
        </div>

        <!-- 搜索历史 -->
        <div v-else-if="searchHistory.length > 0 && !searchQuery" class="py-2">
          <div class="flex items-center justify-between px-3 py-1 border-b border-gray-100 dark:border-gray-700">
            <span class="text-xs text-gray-500 font-medium">搜索历史</span>
            <n-button
              text
              size="tiny"
              class="text-xs"
              @click="clearHistory"
            >
              清除
            </n-button>
          </div>
          <div
            v-for="(item, index) in displayHistory"
            :key="item"
            class="px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            :class="[
              index === selectedIndex && 'bg-blue-50 dark:bg-blue-900',
            ]"
            @click="selectHistory(item)"
            @mouseenter="selectedIndex = index"
          >
            <n-icon :size="16" class="text-gray-400">
              <i class="i-tabler-clock" />
            </n-icon>
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ item }}</span>
          </div>
        </div>

        <!-- 无结果 -->
        <div v-else-if="searchQuery && !isSearching" class="p-4 text-center text-gray-500">
          <n-icon :size="32" class="mb-2 text-gray-300">
            <i class="i-tabler-search-off" />
          </n-icon>
          <div class="text-sm">
            未找到相关结果
          </div>
          <div class="text-xs mt-1">
            尝试使用不同的关键词或标签
          </div>
        </div>
      </div>
    </div>

    <!-- 高级搜索面板 -->
    <transition name="slide-down">
      <div
        v-if="showAdvanced"
        class="advanced-search-panel mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 搜索范围选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              搜索范围
            </label>
            <div class="space-y-2">
              <n-checkbox v-model:checked="enabledFields.title" label="标题" />
              <n-checkbox v-model:checked="enabledFields.description" label="描述" />
              <n-checkbox v-model:checked="enabledFields.tags" label="标签" />
              <n-checkbox v-model:checked="enabledFields.url" label="链接地址" />
            </div>
          </div>

          <!-- 搜索统计 -->
          <div v-if="searchResults.length > 0">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              搜索统计
            </label>
            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>{{ searchStats.resultsText }}</div>
              <div v-if="pagination.totalPages > 1">
                第 {{ pagination.page }} / {{ pagination.totalPages }} 页
              </div>
              <div v-if="searchQuery">
                关键词：<span class="font-medium">"{{ searchQuery }}"</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 flex gap-2">
          <n-button size="small" @click="handleClearSearch">
            <template #icon>
              <i class="i-tabler-x" />
            </template>
            清空搜索
          </n-button>
          <n-button size="small" @click="clearHistory">
            <template #icon>
              <i class="i-tabler-history" />
            </template>
            清除历史
          </n-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.search-dropdown {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 高亮样式 */
:deep(mark) {
  background-color: #fef08a;
  padding: 0 1px;
  border-radius: 2px;
  font-weight: 500;
}

:deep(.dark mark) {
  background-color: #ca8a04;
  color: white;
}

/* 滚动条样式 */
.search-dropdown::-webkit-scrollbar {
  width: 4px;
}

.search-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.search-dropdown::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}

.search-dropdown::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
</style>