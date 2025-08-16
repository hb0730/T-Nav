<script setup lang="ts">
interface SiteInfo {
  title: string
  description: string
  domain: string
  url: string
}

interface Props {
  url: string
  modelValue?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const message = useMessage()

const show = computed({
  get: () => props.modelValue ?? false,
  set: value => emit('update:modelValue', value),
})

const loading = ref(false)
const error = ref('')
const siteInfo = ref<SiteInfo | null>(null)
const faviconUrl = ref('')

const isHttps = computed(() => {
  return props.url.startsWith('https://')
})

// 加载网站预览
async function loadPreview() {
  if (!props.url)
    return

  loading.value = true
  error.value = ''

  try {
    // 并行获取网站信息和favicon
    const [siteResponse, faviconResponse] = await Promise.allSettled([
      $fetch<{ success: boolean, data: SiteInfo }>('/api/utils/site-info', {
        query: { url: props.url },
      }),
      $fetch<{ success: boolean, data: { url: string } }>('/api/utils/favicon', {
        query: { url: props.url },
      }),
    ])

    // 处理网站信息
    if (siteResponse.status === 'fulfilled' && siteResponse.value.success) {
      siteInfo.value = siteResponse.value.data
    }
    else {
      error.value = '无法获取网站信息'
    }

    // 处理favicon
    if (faviconResponse.status === 'fulfilled' && faviconResponse.value.success) {
      faviconUrl.value = faviconResponse.value.data.url
    }
  }
  catch {
    error.value = '网站预览加载失败'
  }
  finally {
    loading.value = false
  }
}

// 打开网站
function openWebsite() {
  if (props.url) {
    window.open(props.url, '_blank')
  }
}

// 复制URL
async function copyUrl() {
  if (props.url) {
    try {
      await navigator.clipboard.writeText(props.url)
      message.success('链接已复制到剪贴板')
    }
    catch {
      message.error('复制失败')
    }
  }
}

// 监听URL变化
watch(() => props.url, (newUrl) => {
  if (newUrl && show.value) {
    loadPreview()
  }
}, { immediate: true })

// 监听显示状态变化
watch(show, (newShow) => {
  if (newShow && props.url) {
    loadPreview()
  }
})
</script>

<template>
  <n-card v-if="show" class="website-preview" size="small" style="max-width: 400px;">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">网站预览</span>
        <n-button quaternary circle size="small" @click="show = false">
          <template #icon>
            <i class="i-tabler-x text-sm" />
          </template>
        </n-button>
      </div>
    </template>

    <div v-if="loading" class="flex items-center justify-center py-8">
      <n-spin size="small" />
      <span class="ml-2 text-sm text-gray-500">加载预览中...</span>
    </div>

    <div v-else-if="error" class="text-center py-4">
      <i class="i-tabler-alert-circle text-red-500 text-2xl mb-2" />
      <div class="text-sm text-red-500">
        {{ error }}
      </div>
      <n-button size="small" type="primary" ghost class="mt-2" @click="loadPreview">
        重试
      </n-button>
    </div>

    <div v-else class="space-y-3">
      <!-- 网站基本信息 -->
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <img
            v-if="faviconUrl"
            :src="faviconUrl"
            :alt="siteInfo?.title"
            class="w-8 h-8 rounded"
            @error="faviconUrl = ''"
          >
          <div v-else class="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
            <i class="i-tabler-world text-gray-400 text-sm" />
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm truncate">
            {{ siteInfo?.title || 'Loading...' }}
          </div>
          <div class="text-xs text-gray-500 truncate">
            {{ siteInfo?.domain }}
          </div>
        </div>

        <n-button size="tiny" type="primary" ghost @click="openWebsite">
          <template #icon>
            <i class="i-tabler-external-link text-xs" />
          </template>
        </n-button>
      </div>

      <!-- 网站描述 -->
      <div v-if="siteInfo?.description" class="text-xs text-gray-600 line-clamp-3 leading-relaxed">
        {{ siteInfo.description }}
      </div>

      <!-- 网站状态 -->
      <div class="flex items-center justify-between pt-2 border-t border-gray-100">
        <div class="flex items-center space-x-2">
          <n-tag size="small" :type="isHttps ? 'success' : 'warning'">
            {{ isHttps ? 'HTTPS' : 'HTTP' }}
          </n-tag>
          <span class="text-xs text-gray-400">
            {{ new Date().toLocaleString('zh-CN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }) }}
          </span>
        </div>

        <n-button size="tiny" @click="copyUrl">
          <template #icon>
            <i class="i-tabler-copy text-xs" />
          </template>
        </n-button>
      </div>
    </div>
  </n-card>
</template>

<style scoped>
.website-preview {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
