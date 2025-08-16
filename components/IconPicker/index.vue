<script setup lang="ts">
import type { IconInfo } from '~/lib/icons-data'
import { useImageUtils } from '~/composables/useImageUtils'
import {
  ALL_ICONS,
  getIconsPage,
  getTotalPages,
  ICONS_BY_PREFIX,
  PRESET_ICONS,
  searchIcons,
} from '~/lib/icons-data'

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
const currentPage = ref(1)
const activePrefix = ref<'all' | 'tabler' | 'logos'>('tabler')

// 使用导入的预设图标
const presetIcons = PRESET_ICONS

// 获取当前选择的图标集合
const currentIcons = computed(() => {
  let icons: IconInfo[]

  if (activePrefix.value === 'all') {
    icons = ALL_ICONS
  }
  else {
    icons = ICONS_BY_PREFIX[activePrefix.value] || []
  }

  // 应用搜索过滤
  if (searchQuery.value.trim()) {
    icons = searchIcons(icons, searchQuery.value)
  }

  return icons
})

// 获取当前页的图标
const currentPageIcons = computed(() => {
  return getIconsPage(currentIcons.value, currentPage.value)
})

// 总页数
const totalPages = computed(() => {
  return getTotalPages(currentIcons.value)
})

// 监听搜索查询变化，重置页码
watch(searchQuery, () => {
  currentPage.value = 1
})

// 监听前缀变化，重置页码
watch(activePrefix, () => {
  currentPage.value = 1
})

function selectIcon(iconValue: string) {
  emit('update:modelValue', iconValue)
}

// 使用共享的图片工具函数
const { isImageUrl, getImageUrl } = useImageUtils()
</script>

<template>
  <div class="space-y-4">
    <div v-if="modelValue" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div class="flex items-center space-x-3">
        <span class="text-sm text-gray-600">当前选择：</span>
        <div class="flex items-center space-x-2">
          <img
            v-if="isImageUrl(modelValue)"
            :src="getImageUrl(modelValue)"
            class="w-6 h-6"
            @error="imageError = true"
          >
          <i
            v-else
            :class="modelValue"
            class="text-xl"
          />
          <span class="text-sm font-mono text-gray-700">{{ modelValue }}</span>
        </div>
      </div>
      <n-button size="small" quaternary type="error" @click="selectIcon('')">
        <template #icon>
          <i class="i-tabler-x" />
        </template>
        清除
      </n-button>
    </div>

    <n-tabs type="line" animated>
      <n-tab-pane name="preset" tab="预设图标">
        <div class="grid grid-cols-6 gap-3 max-h-60 overflow-y-auto p-2">
          <div
            v-for="icon in presetIcons"
            :key="icon.name"
            class="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
            :class="{ 'border-blue-500 bg-blue-50': modelValue === icon.value }"
            @click="selectIcon(icon.value)"
          >
            <i :class="icon.value" class="text-2xl mb-1" />
            <span class="text-xs text-gray-600 text-center">{{ icon.name }}</span>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="icons" tab="图标库">
        <div class="space-y-3">
          <!-- 图标集选择器 -->
          <div class="flex gap-2">
            <n-button
              :type="activePrefix === 'tabler' ? 'primary' : 'default'"
              size="small"
              @click="activePrefix = 'tabler'"
            >
              Tabler ({{ ICONS_BY_PREFIX.tabler.length }})
            </n-button>
            <n-button
              :type="activePrefix === 'logos' ? 'primary' : 'default'"
              size="small"
              @click="activePrefix = 'logos'"
            >
              Logos ({{ ICONS_BY_PREFIX.logos.length }})
            </n-button>
            <n-button
              :type="activePrefix === 'all' ? 'primary' : 'default'"
              size="small"
              @click="activePrefix = 'all'"
            >
              全部 ({{ ALL_ICONS.length }})
            </n-button>
          </div>

          <!-- 搜索框 -->
          <n-input
            v-model:value="searchQuery"
            placeholder="搜索图标..."
            clearable
          >
            <template #prefix>
              <i class="i-tabler-search" />
            </template>
          </n-input>

          <!-- 统计信息 -->
          <div class="text-sm text-gray-600">
            共找到 {{ currentIcons.length }} 个图标，第 {{ currentPage }} / {{ totalPages }} 页
          </div>

          <!-- 图标网格 -->
          <div class="grid grid-cols-10 gap-2 max-h-80 overflow-y-auto p-2 border rounded">
            <div
              v-for="icon in currentPageIcons"
              :key="icon.className"
              class="flex flex-col items-center p-2 border rounded cursor-pointer hover:bg-blue-50 transition-colors"
              :class="{ 'border-blue-500 bg-blue-50': modelValue === icon.className }"
              :title="`${icon.name} (${icon.prefix})`"
              @click="selectIcon(icon.className)"
            >
              <i :class="icon.className" class="text-lg mb-1" />
              <span class="text-xs text-gray-500 text-center break-all leading-tight">{{ icon.name }}</span>
            </div>
          </div>

          <!-- 分页控件 -->
          <div v-if="totalPages > 1" class="flex justify-center">
            <n-pagination
              v-model:page="currentPage"
              :page-count="totalPages"
              size="small"
            />
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="custom" tab="自定义">
        <div class="space-y-4">
          <n-tabs type="segment" size="small">
            <n-tab-pane name="icon-class" tab="图标类名">
              <div class="space-y-3">
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
              <div class="space-y-3">
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
                <i
                  v-else
                  :class="modelValue"
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
