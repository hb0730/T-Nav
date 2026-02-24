<script setup lang="ts">
import type { SearchResult } from '~/composables/useSearch'
import ToolCardLogo from '~/components/ToolCardLogo'
import { useCommandPalette } from '~/composables/useCommandPalette'
import { useGlobalSearchInstance } from '~/composables/useGlobalSearch'

const { textCommand } = useCommandPalette()
const {
  isOpen,
  query,
  results,
  isLoading,
  total,
  hasMore,
  open,
  close,
  loadMore: _loadMore,
  setupShortcuts,
  highlight,
} = useGlobalSearchInstance()

// 初始化快捷键
onMounted(() => {
  setupShortcuts()
})

// 选中的索引
const selectedIndex = ref(0)
const inputRef = ref<HTMLElement>()

// 处理选择
function selectResult(result?: SearchResult) {
  const target = result || results.value[selectedIndex.value]
  if (target && target.url) {
    window.open(target.url, '_blank')
    handleClose()
  }
}

// 改进的关闭处理
function handleClose() {
  query.value = ''
  selectedIndex.value = 0
  close()
}

// 键盘导航
function handleKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      break
    case 'Enter':
      e.preventDefault()
      selectResult()
      break
    case 'Escape':
      e.preventDefault()
      handleClose()
      break
  }
}

// 监听模态框状态
watch(isOpen, (open) => {
  if (open) {
    selectedIndex.value = 0
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
  else {
    query.value = ''
  }
})

// 重置选中索引
watch(results, () => {
  selectedIndex.value = 0
})
</script>

<template>
  <!-- 搜索按钮 -->
  <n-button
    class="flex-1 justify-start text-gray-500"
    ghost
    @click="open"
  >
    <template #icon>
      <i class="i-tabler-search" />
    </template>
    <span class="ml-2">搜索</span>
    <span class="ml-auto text-xs opacity-50 border border-current rounded px-1">
      {{ textCommand }}
    </span>
  </n-button>

  <!-- 搜索模态框 -->
  <n-modal
    v-model:show="isOpen"
    preset="card"
    class="w-full max-w-2xl"
    :closable="true"
    :mask-closable="true"
    :close-on-esc="true"
    :style="{
      marginTop: '5vh',
      maxHeight: '85vh',
    }"
    transform-origin="center"
    @close="handleClose"
    @mask-click="handleClose"
  >
    <div class="space-y-4">
      <!-- 搜索输入 -->
      <n-input
        ref="inputRef"
        v-model:value="query"
        size="large"
        :placeholder="`搜索网站、标签或描述... (${textCommand})`"
        :loading="isLoading"
        clearable
        @keydown="handleKeydown"
      >
        <template #prefix>
          <i class="i-tabler-search text-lg" />
        </template>
      </n-input>

      <!-- 搜索结果 -->
      <div
        v-if="results.length"
        class="max-h-[60vh] overflow-y-auto border rounded-lg"
      >
        <div class="p-2 text-xs text-gray-500 border-b bg-gray-50 dark:bg-gray-800">
          共找到 {{ total }} 个结果
        </div>

        <div
          v-for="(result, index) in results"
          :key="result.id"
          class="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b last:border-b-0"
          :class="{ 'bg-blue-50 dark:bg-blue-900': index === selectedIndex }"
          @click="selectResult(result)"
          @mouseenter="selectedIndex = index"
        >
          <div class="flex items-start gap-3">
            <!-- Logo -->
            <div class="w-8 h-8 flex-shrink-0 mt-1">
              <!-- <img
                v-if="result.logo"
                :src="result.logo"
                :alt="result.title"
                class="w-full h-full object-contain rounded"
              >
              <div v-else class="w-full h-full bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                <i class="i-tabler-link text-gray-400" />
              </div> -->
              <ToolCardLogo :logo="result.logo" :title="result.title" />
            </div>

            <!-- 内容 -->
            <div class="flex-1 min-w-0">
              <div
                class="font-medium text-gray-900 dark:text-gray-100 mb-1"
                v-html="highlight(result.title)"
              />
              <div
                v-if="result.description"
                class="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2"
                v-html="highlight(result.description)"
              />

              <!-- 分类和标签 -->
              <div class="flex items-center gap-2 text-xs">
                <span
                  v-if="result.category"
                  class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                >
                  {{ result.category.title }}
                </span>
                <div class="flex gap-1">
                  <span
                    v-for="tag in result.tags.slice(0, 3)"
                    :key="tag"
                    class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                    v-html="highlight(tag)"
                  />
                  <span v-if="result.tags.length > 3" class="text-gray-500">
                    +{{ result.tags.length - 3 }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 外部链接图标 -->
            <div class="flex-shrink-0 mt-1">
              <i class="i-tabler-external-link text-gray-400" />
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMore" class="p-3 border-t">
          <n-button
            block
            text
            :loading="isLoading"
            @click="_loadMore"
          >
            加载更多
          </n-button>
        </div>
      </div>

      <!-- 无结果 -->
      <div
        v-else-if="query && !isLoading"
        class="text-center py-8 text-gray-500"
      >
        <i class="i-tabler-search-off text-4xl mb-2" />
        <div>未找到相关结果</div>
        <div class="text-sm">
          尝试使用不同的关键词
        </div>
      </div>

      <!-- 帮助提示 -->
      <div
        v-if="!query"
        class="text-center py-8 text-gray-400 text-sm"
      >
        <div class="space-y-2">
          <div>💡 支持搜索网站标题、描述和标签</div>
          <div>🔥 使用 <kbd class="px-1 bg-gray-100 dark:bg-gray-800 rounded">{{ textCommand }}</kbd> 快速打开搜索</div>
          <div>⚡ 支持键盘导航：↑↓ 选择，Enter 打开</div>
        </div>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

kbd {
  font-family: inherit;
  font-size: 0.875em;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  border: 1px solid currentColor;
}

:deep(mark) {
  background-color: #fef08a;
  color: inherit;
  padding: 0 1px;
  border-radius: 2px;
  font-weight: 500;
}

:deep(.dark mark) {
  background-color: #ca8a04;
  color: white;
}
</style>
