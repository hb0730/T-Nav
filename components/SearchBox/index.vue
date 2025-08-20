<script setup lang="ts">
import type { SearchResult } from '~/composables/useSearch'
import { useSearch } from '~/composables/useSearch'

interface Props {
  placeholder?: string
  size?: 'small' | 'medium' | 'large'
  maxResults?: number
  enableHistory?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索...',
  size: 'medium',
  maxResults: 8,
  enableHistory: true,
})

const emit = defineEmits<{
  select: [result: SearchResult]
}>()

const {
  query,
  results,
  isLoading,
  total,
  history,
  loadMore: _loadMore,
  clearHistory,
  highlight,
} = useSearch({
  debounce: 300,
  pageSize: 20,
  enableHistory: props.enableHistory,
})

// UI 状态
const showDropdown = ref(false)
const selectedIndex = ref(-1)
const inputRef = ref<HTMLElement>()
const searchBoxRef = ref<HTMLElement>()

// 显示的结果
const displayResults = computed(() => {
  return results.value.slice(0, props.maxResults)
})

const displayHistory = computed(() => {
  return query.value ? [] : history.value.slice(0, 6)
})

// 处理焦点
function handleFocus() {
  showDropdown.value = true
}

function handleBlur() {
  // 使用 setTimeout 延迟关闭，避免点击结果时立即关闭
  setTimeout(() => {
    closeDropdown()
  }, 200)
}

// 点击外部关闭下拉框
function handleClickOutside(event: MouseEvent) {
  if (searchBoxRef.value && !searchBoxRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

// 设置外部点击监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 键盘导航
function handleKeydown(e: KeyboardEvent) {
  const totalItems = displayResults.value.length + displayHistory.value.length

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, totalItems - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      e.preventDefault()
      if (selectedIndex.value >= 0) {
        if (selectedIndex.value < displayResults.value.length) {
          const result = displayResults.value[selectedIndex.value]
          if (result) {
            selectResult(result)
          }
        }
        else {
          const historyIndex = selectedIndex.value - displayResults.value.length
          selectHistory(displayHistory.value[historyIndex] || '')
        }
      }
      break
    case 'Escape':
      closeDropdown()
      inputRef.value?.blur()
      break
  }
}

function selectResult(result: SearchResult) {
  emit('select', result)
  closeDropdown()
}

function selectHistory(historyItem: string) {
  query.value = historyItem
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 统一的关闭下拉框方法
function closeDropdown() {
  showDropdown.value = false
  selectedIndex.value = -1
}

// 暴露方法
defineExpose({
  focus: () => inputRef.value?.focus(),
  clear: () => { query.value = '' },
})
</script>

<template>
  <div ref="searchBoxRef" class="search-box relative">
    <n-input
      ref="inputRef"
      v-model:value="query"
      :placeholder="placeholder"
      :size="size"
      :loading="isLoading"
      clearable
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    >
      <template #prefix>
        <i class="i-tabler-search text-gray-400" />
      </template>
    </n-input>

    <!-- 下拉结果 -->
    <transition name="fade">
      <div
        v-if="showDropdown && (displayResults.length || displayHistory.length || isLoading)"
        class="search-dropdown absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-[70vh] overflow-y-auto"
        :style="{
          transform: 'translateY(4px)',
          minHeight: '200px',
        }"
      >
        <!-- 关闭按钮 -->
        <div v-if="!isLoading" class="flex justify-end p-2 border-b border-gray-200 dark:border-gray-600">
          <n-button
            size="tiny"
            text
            class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
            title="关闭搜索结果"
            @click="closeDropdown"
          >
            <i class="i-tabler-x text-sm" />
          </n-button>
        </div>
        <!-- 加载状态 -->
        <div v-if="isLoading" class="p-4 text-center">
          <n-spin size="small" />
          <span class="ml-2 text-sm text-gray-500">搜索中...</span>
        </div>

        <!-- 搜索结果 -->
        <div v-else-if="displayResults.length" class="py-2">
          <div class="px-3 py-1 text-xs text-gray-500 border-b">
            共 {{ total }} 个结果
          </div>
          <div
            v-for="(result, index) in displayResults"
            :key="result.id"
            class="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            :class="{ 'bg-blue-50 dark:bg-blue-900': index === selectedIndex }"
            @click="selectResult(result)"
            @mouseenter="selectedIndex = index"
          >
            <div class="flex items-center gap-3">
              <!-- 图标 -->
              <div class="w-5 h-5 flex-shrink-0">
                <img
                  v-if="result.logo"
                  :src="result.logo"
                  :alt="result.title"
                  class="w-full h-full object-contain"
                >
                <i v-else class="i-tabler-link text-gray-400" />
              </div>

              <!-- 内容 -->
              <div class="flex-1 min-w-0">
                <div
                  class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                  v-html="highlight(result.title)"
                />
                <div
                  v-if="result.description"
                  class="text-xs text-gray-500 truncate"
                  v-html="highlight(result.description)"
                />

                <!-- 分类和标签 -->
                <div class="flex items-center gap-2 mt-1">
                  <span
                    v-if="result.category"
                    class="text-xs text-gray-400"
                  >
                    {{ result.category.title }}
                  </span>
                  <div class="flex gap-1">
                    <span
                      v-for="tag in result.tags.slice(0, 2)"
                      :key="tag"
                      class="text-xs px-1 bg-gray-100 dark:bg-gray-700 rounded"
                      v-html="highlight(tag)"
                    />
                  </div>
                </div>
              </div>

              <i class="i-tabler-external-link text-gray-400 text-xs" />
            </div>
          </div>

          <!-- 更多结果提示 -->
          <div
            v-if="results.length > maxResults"
            class="px-3 py-2 text-xs text-gray-500 text-center border-t"
          >
            还有 {{ results.length - maxResults }} 个结果
          </div>
        </div>

        <!-- 搜索历史 -->
        <div v-else-if="displayHistory.length" class="py-2">
          <div class="flex items-center justify-between px-3 py-1 border-b">
            <span class="text-xs text-gray-500">搜索历史</span>
            <n-button text size="tiny" @click="clearHistory">
              清除
            </n-button>
          </div>
          <div
            v-for="(item, index) in displayHistory"
            :key="item"
            class="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
            :class="{ 'bg-blue-50 dark:bg-blue-900': displayResults.length + index === selectedIndex }"
            @click="selectHistory(item)"
            @mouseenter="selectedIndex = displayResults.length + index"
          >
            <i class="i-tabler-clock text-gray-400 text-sm" />
            <span class="text-sm">{{ item }}</span>
          </div>
        </div>

        <!-- 无结果 -->
        <div v-else-if="query" class="p-4 text-center">
          <i class="i-tabler-search-off text-gray-300 text-2xl mb-2" />
          <div class="text-sm text-gray-500">
            未找到相关结果
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.search-dropdown {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

:deep(mark) {
  background-color: #fef08a;
  color: inherit;
  padding: 0;
  font-weight: 500;
}

:deep(.dark mark) {
  background-color: #ca8a04;
  color: white;
}
</style>
