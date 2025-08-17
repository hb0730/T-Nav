<script setup lang="ts">
import type { IconData } from './data'
import TheIcon from '~/components/TheIcon/index'
import { useDebounce } from '~/composables/useDebounce'
import { useIconCache } from '~/composables/useIconCache'
import { useImageUtils } from '~/composables/useImageUtils'
import { useVirtualList } from '~/composables/useVirtualList'
import {
  getAllIcons,
  getCommonIcons,
  getIconsByCollection,
  iconCollections,

  searchIcons,
} from './data'

interface Props {
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const searchQuery = ref('')
const imageError = ref(false)
const activeCollection = ref<string>('Tabler Icons')
const isSearching = ref(false)
const isLoading = ref(false)
const currentIcons = ref<IconData[]>([])
const presetIcons = ref<Array<{ name: string, value: string }>>([])
const allIconsCount = ref(0)

// 使用防抖搜索
const debouncedSearchQuery = useDebounce(searchQuery, 300)
const iconCache = useIconCache()

// 获取图标的key值用于显示（原始格式，如iconify-tabler:robot）
function getIconKey(icon: IconData) {
  return icon.key
}
// 加载预设图标
async function loadPresetIcons() {
  const cacheKey = 'preset-icons'
  if (iconCache.has(cacheKey)) {
    presetIcons.value = iconCache.get(cacheKey)
    return
  }

  const commonIcons = await getCommonIcons()
  const formatted = commonIcons.map(icon => ({
    name: icon.keywords.join(' ') || icon.name,
    value: icon.key || '',
  }))

  presetIcons.value = formatted
  iconCache.set(cacheKey, formatted)
}

// 加载图标数据
async function loadIcons() {
  if (isLoading.value)
    return

  isLoading.value = true
  try {
    let icons: IconData[]

    const cacheKey = `icons-${activeCollection.value}-${debouncedSearchQuery.value}`

    if (iconCache.has(cacheKey)) {
      icons = iconCache.get(cacheKey)
    }
    else {
      // 应用搜索过滤
      if (debouncedSearchQuery.value.trim()) {
        icons = await searchIcons(debouncedSearchQuery.value)
      }
      else {
        // 根据选择的集合过滤
        icons = await getIconsByCollection(activeCollection.value)
      }

      iconCache.set(cacheKey, icons)
    }

    currentIcons.value = icons
  }
  catch (error) {
    console.error('Failed to load icons:', error)
    currentIcons.value = []
  }
  finally {
    isLoading.value = false
  }
}

// 初始化加载所有图标数量
async function loadIconsCount() {
  try {
    const allIcons = await getAllIcons()
    allIconsCount.value = allIcons.length
  }
  catch (error) {
    console.error('Failed to load icons count:', error)
  }
}

// 虚拟滚动配置
const ITEM_HEIGHT = 50
const CONTAINER_HEIGHT = 320 // h-80 = 20rem = 320px
const GRID_COLUMNS = 6
const ITEMS_PER_ROW = GRID_COLUMNS
const ROW_HEIGHT = ITEM_HEIGHT

// 转换为行数据用于虚拟滚动
const iconRows = computed(() => {
  const icons = currentIcons.value
  const rows: (IconData | null)[][] = []
  for (let i = 0; i < icons.length; i += ITEMS_PER_ROW) {
    const row: (IconData | null)[] = icons.slice(i, i + ITEMS_PER_ROW)
    // 确保每行都有8个元素，不足的用null填充
    while (row.length < ITEMS_PER_ROW) {
      row.push(null)
    }
    rows.push(row)
  }
  return rows
})

// 使用虚拟滚动
const {
  containerRef,
  visibleItems,
  totalHeight,
  offsetY,
  handleScroll,
} = useVirtualList(iconRows, {
  itemHeight: ROW_HEIGHT,
  containerHeight: CONTAINER_HEIGHT - 60, // 减去控制区域高度
  overscan: 3,
})

// 监听搜索状态
watch(searchQuery, () => {
  isSearching.value = true
})

watch(debouncedSearchQuery, () => {
  isSearching.value = false
  loadIcons()
  // 搜索完成后滚动到顶部
  nextTick(() => {
    if (containerRef.value) {
      containerRef.value.scrollTop = 0
    }
  })
})

// 监听集合变化
watch(activeCollection, () => {
  loadIcons()
  nextTick(() => {
    if (containerRef.value) {
      containerRef.value.scrollTop = 0
    }
  })
})

// 组件挂载时加载数据
onMounted(async () => {
  await Promise.all([
    loadPresetIcons(),
    loadIconsCount(),
    loadIcons(),
  ])
})

function selectIcon(iconKey: string) {
  // 直接使用iconify格式
  emit('update:modelValue', iconKey)
}

// 使用共享的图片工具函数
const { isImageUrl, getImageUrl } = useImageUtils()
</script>

<template>
  <div class="space-y-4">
    <div v-if="modelValue" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div class="flex items-center space-x-3">
        <span class="text-sm text-gray-600 dark:text-gray-400">当前选择：</span>
        <div class="flex items-center space-x-2">
          <img
            v-if="isImageUrl(modelValue)"
            :src="getImageUrl(modelValue)"
            class="w-6 h-6"
            @error="imageError = true"
          >
          <TheIcon
            v-else
            :key="modelValue"
            :icon="modelValue"
            class="text-xl"
          />
          <span class="text-sm font-mono text-gray-700 dark:text-gray-300">{{ modelValue }}</span>
        </div>
      </div>
      <n-button size="small" quaternary type="error" @click="selectIcon('')">
        <template #icon>
          <TheIcon icon="i-tabler-x" />
        </template>
        清除
      </n-button>
    </div>

    <n-tabs type="line" animated class="w-full">
      <n-tab-pane name="preset" tab="预设图标" class="w-full">
        <div class="h-80 w-full flex flex-col">
          <div class="w-full grid grid-cols-8 gap-2  overflow-y-auto mb-2">
            <div
              v-for="icon in presetIcons"
              :key="icon.name"
              class="w-full flex flex-col items-center p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 transform hover:scale-105"
              :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md': modelValue === icon.value }"
              @click="selectIcon(icon.value)"
            >
              <TheIcon :icon="icon.value" class="text-xl mb-1" />
              <span class="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight truncate w-full mt-1">{{ icon.name }}</span>
            </div>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="icons" tab="图标库" class="w-full">
        <div class="h-80 w-full flex flex-col">
          <!-- 控制区域 -->
          <div class="flex-shrink-0 w-full space-y-1 px-2 py-1">
            <!-- 图标集选择器和搜索框在同一行 -->
            <div class="w-full flex gap-1 items-center overflow-hidden">
              <!-- 左侧按钮组 - 限制最大宽度 -->
              <div class="flex gap-1  overflow-hidden">
                <n-button
                  v-for="collection in iconCollections"
                  :key="collection.name"
                  :type="activeCollection === collection.name ? 'primary' : 'default'"
                  size="tiny"
                  :loading="isLoading && activeCollection === collection.name"
                  class=" flex-1 text-xs px-2"
                  @click="activeCollection = collection.name"
                >
                  <span class="truncate">{{ collection.name }}</span>
                </n-button>
                <n-button
                  :type="activeCollection === 'all' ? 'primary' : 'default'"
                  size="tiny"
                  :loading="isLoading && activeCollection === 'all'"
                  class="flex-1 text-xs px-1 min-w-0"
                  @click="activeCollection = 'all'"
                >
                  <span class="truncate">全部</span>
                </n-button>
              </div>

              <!-- 右侧搜索框 - 扩大宽度 -->
              <div class="flex-shrink-0">
                <n-input
                  v-model:value="searchQuery"
                  placeholder="搜索图标"
                  size="small"
                  clearable
                  class="w-full"
                >
                  <template #prefix>
                    <TheIcon icon="i-tabler-search" />
                  </template>
                  <template #suffix>
                    <TheIcon v-if="isSearching" icon="i-tabler-loader-2" class="animate-spin text-gray-400" />
                  </template>
                </n-input>
              </div>
            </div>
          </div>

          <!-- 图标网格区域 - 虚拟滚动 -->
          <div
            ref="containerRef"
            class="overflow-y-auto p-2 w-full"
            @scroll="handleScroll"
          >
            <!-- 加载状态 -->
            <template v-if="isLoading">
              <div class="flex items-center justify-center h-32">
                <div class="flex flex-col items-center space-y-2">
                  <TheIcon icon="i-tabler-loader-2" class="animate-spin text-xl text-gray-400" />
                  <span class="text-sm text-gray-500">加载图标中...</span>
                </div>
              </div>
            </template>

            <!-- 空状态 -->
            <template v-else-if="currentIcons.length === 0">
              <div class="flex items-center justify-center h-32">
                <div class="flex flex-col items-center space-y-2 text-center">
                  <TheIcon icon="i-tabler-search-off" class="text-2xl text-gray-300" />
                  <div class="text-sm text-gray-500">
                    <div>未找到匹配的图标</div>
                    <div v-if="debouncedSearchQuery" class="text-xs mt-1">
                      尝试使用其他关键词搜索
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- 虚拟滚动容器 -->
            <template v-else>
              <div :style="{ height: `${totalHeight}px`, position: 'relative', width: '100%' }">
                <div :style="{ transform: `translateY(${offsetY}px)` }">
                  <div
                    v-for="(row, rowIndex) in visibleItems"
                    :key="rowIndex"
                    class="w-full grid grid-cols-6 gap-2 overflow-hidden mb-2"
                  >
                    <template v-for="(icon, iconIndex) in row.item" :key="icon?.name || `empty-${iconIndex}`">
                      <div
                        v-if="icon"
                        class="w-full h-full flex flex-col items-center p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 transform hover:scale-105 overflow-hidden"
                        :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md': modelValue === icon.key }"
                        :title="`${icon.name} (${icon.collection})`"
                        @click="selectIcon(icon.key)"
                      >
                        <TheIcon :icon="getIconKey(icon)" class="text-xl mb-1" />
                        <span class="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight truncate w-full mt-1">{{ icon.name }}</span>
                      </div>
                      <div v-else class="w-full" />
                    </template>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="custom" tab="自定义">
        <div class="space-y-4">
          <n-tabs type="segment" size="small">
            <n-tab-pane name="icon-class" tab="图标类名">
              <div class="space-y-3 w-xl">
                <n-input
                  :value="modelValue"
                  placeholder="请输入图标类名，如：i-tabler-heart"
                  @input="$emit('update:modelValue', $event)"
                />
                <div class="text-xs text-gray-500">
                  支持UnoCSS图标类名，如：i-tabler-heart、i-logos-vue等
                </div>
              </div>
            </n-tab-pane>

            <n-tab-pane name="image-url" tab="图片URL">
              <div class="space-y-3 w-xl">
                <n-input
                  :value="modelValue"
                  placeholder="请输入图片URL或路径，如：/imgs/ai/ai-logo.png"
                  @input="$emit('update:modelValue', $event)"
                />
                <div class="text-xs text-gray-500">
                  支持网络图片URL、相对路径（/imgs/...）或绝对URL。旧的/assets/imgs/路径会自动转换。
                </div>
              </div>
            </n-tab-pane>
          </n-tabs>

          <div v-if="modelValue" class="p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600 mb-2">
              预览：
            </p>
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 flex items-center justify-center">
                <img
                  v-if="isImageUrl(modelValue)"
                  :src="getImageUrl(modelValue)"
                  class="max-w-8 max-h-8 object-contain"
                  @error="imageError = true"
                  @load="imageError = false"
                >
                <TheIcon
                  v-else
                  :key="modelValue"
                  :icon="modelValue"
                  class="text-2xl"
                />
                <div v-if="imageError && isImageUrl(modelValue)" class="text-red-500 text-xs">
                  ✗
                </div>
              </div>
              <div class="flex-1">
                <div class="text-sm text-gray-600 font-mono break-all">
                  {{ modelValue }}
                </div>
                <div class="text-xs text-gray-400">
                  {{ isImageUrl(modelValue) ? '图片' : '图标类' }}
                  {{ imageError && isImageUrl(modelValue) ? ' (加载失败)' : '' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>
