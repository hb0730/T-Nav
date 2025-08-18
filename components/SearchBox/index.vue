<template>
  <div class="search-box-container">
    <!-- 搜索输入框 -->
    <div class="relative">
      <n-input-group>
        <n-input
          ref="searchInputRef"
          v-model:value="searchQuery"
          :placeholder="placeholder"
          :size="size"
          clearable
          @focus="showDropdown = true"
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
            搜索结果 ({{ searchResults.length }})
          </div>
          <div
            v-for="(result, index) in displayResults"
            :key="result.id"
            :class="[
              'px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
              index === selectedIndex && 'bg-blue-50 dark:bg-blue-900'
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
                />
                <n-icon v-else :size="20" class="text-gray-400">
                  <i class="i-tabler-link" />
                </n-icon>
              </div>

              <!-- 内容 -->
              <div class="flex-1 min-w-0">
                <div
                  class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                  v-html="result.displayTitle || result.title"
                />
                <div
                  v-if="result.displayDescription || result.description"
                  class="text-xs text-gray-500 dark:text-gray-400 truncate mt-1"
                  v-html="result.displayDescription || result.description"
                />
                
                <!-- 标签 -->
                <div v-if="result.tags && result.tags.length > 0" class="flex flex-wrap gap-1 mt-1">
                  <n-tag
                    v-for="tag in result.tags.slice(0, 3)"
                    :key="tag"
                    size="small"
                    class="text-xs"
                  >
                    {{ tag }}
                  </n-tag>
                  <span v-if="result.tags.length > 3" class="text-xs text-gray-400">
                    +{{ result.tags.length - 3 }}
                  </span>
                </div>
              </div>

              <!-- 分数（调试模式） -->
              <div v-if="showScore" class="flex-shrink-0 text-xs text-gray-400">
                {{ Math.round(result.score * 100) }}%
              </div>
            </div>
          </div>
          
          <!-- 更多结果提示 -->
          <div
            v-if="searchResults.length > maxDisplayResults"
            class="px-3 py-2 text-xs text-gray-500 text-center border-t border-gray-100 dark:border-gray-700"
          >
            还有 {{ searchResults.length - maxDisplayResults }} 个结果，输入更多关键词以缩小范围
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
            v-for="(item, index) in searchHistory.slice(0, 8)"
            :key="item"
            :class="[
              'px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2',
              index === selectedIndex && 'bg-blue-50 dark:bg-blue-900'
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
          <div class="text-sm">未找到相关结果</div>
          <div class="text-xs mt-1">尝试使用不同的关键词</div>
        </div>
      </div>
    </div>

    <!-- 高级搜索面板 -->
    <transition name="slide-down">
      <div
        v-if="showAdvanced"
        class="advanced-search-panel mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- 搜索字段选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              搜索范围
            </label>
            <n-checkbox-group v-model:value="selectedFields">
              <div class="space-y-1">
                <n-checkbox value="title" label="标题" />
                <n-checkbox value="description" label="描述" />
                <n-checkbox value="tags" label="标签" />
                <n-checkbox value="url" label="链接" />
              </div>
            </n-checkbox-group>
          </div>

          <!-- 分类筛选 -->
          <div v-if="categories && categories.length > 0">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              分类筛选
            </label>
            <n-select
              v-model:value="selectedCategory"
              :options="categoryOptions"
              placeholder="选择分类"
              clearable
            />
          </div>

          <!-- 搜索选项 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              搜索选项
            </label>
            <div class="space-y-2">
              <n-checkbox v-model:checked="includeDeprecated" label="包含已废弃项目" />
              <n-checkbox v-model:checked="showScore" label="显示匹配分数" />
            </div>
          </div>
        </div>

        <!-- 搜索统计 -->
        <div v-if="searchResults.length > 0" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            找到 <span class="font-medium text-blue-600">{{ searchResults.length }}</span> 个结果
            <span v-if="searchQuery">，关键词："{{ searchQuery }}"</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useAdvancedSearch, type SearchableItem, type SearchResult } from '~/composables/useAdvancedSearch'

interface Props {
  items: SearchableItem[]
  placeholder?: string
  size?: 'small' | 'medium' | 'large'
  maxDisplayResults?: number
  showAdvancedButton?: boolean
  categories?: Array<{ id: string; title: string }>
  fields?: string[]
  threshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索...',
  size: 'medium',
  maxDisplayResults: 8,
  showAdvancedButton: true,
  fields: () => ['title', 'description', 'tags', 'url'],
  threshold: 0.3,
})

const emit = defineEmits<{
  select: [result: SearchResult]
  search: [query: string, results: SearchResult[]]
}>()

// 搜索相关状态
const {
  searchQuery,
  searchResults,
  highlightedResults,
  isSearching,
  searchHistory,
  clearHistory,
} = useAdvancedSearch(computed(() => filteredItems.value), {
  fields: props.fields,
  threshold: props.threshold,
  maxResults: 100,
})

// UI 状态
const showDropdown = ref(false)
const showAdvanced = ref(false)
const selectedIndex = ref(-1)
const searchInputRef = ref()

// 高级搜索选项
const selectedFields = ref([...props.fields])
const selectedCategory = ref<string | null>(null)
const includeDeprecated = ref(false)
const showScore = ref(false)

// 分类选项
const categoryOptions = computed(() => [
  { label: '全部分类', value: null },
  ...(props.categories?.map(cat => ({
    label: cat.title,
    value: cat.id,
  })) || []),
])

// 过滤后的项目（应用高级搜索条件）
const filteredItems = computed(() => {
  let items = [...props.items]

  // 分类筛选
  if (selectedCategory.value) {
    items = items.filter(item => item.category === selectedCategory.value)
  }

  // 是否包含已废弃项目
  if (!includeDeprecated.value) {
    items = items.filter(item => !item.deprecated)
  }

  return items
})

// 显示的搜索结果
const displayResults = computed(() => {
  return highlightedResults.value.slice(0, props.maxDisplayResults)
})

// 监听搜索结果变化
watch([searchQuery, searchResults], ([query, results]) => {
  emit('search', query, results)
})

// 切换高级搜索
function toggleAdvancedSearch() {
  showAdvanced.value = !showAdvanced.value
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
  const historyCount = searchQuery.value ? 0 : Math.min(searchHistory.value.length, 8)
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
          selectResult(displayResults.value[selectedIndex.value])
        } else if (historyCount > 0) {
          const historyIndex = selectedIndex.value - resultsCount
          selectHistory(searchHistory.value[historyIndex])
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
function selectResult(result: SearchResult) {
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

// 暴露方法
defineExpose({
  focus: () => searchInputRef.value?.focus(),
  clear: () => {
    searchQuery.value = ''
  },
})
</script>

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
}

:deep(.dark mark) {
  background-color: #ca8a04;
  color: white;
}
</style>