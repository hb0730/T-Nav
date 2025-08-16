<script setup lang="ts">
interface Props {
  modelValue: boolean
  type: 'friend-link' | 'link'
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const message = useMessage()
const { isMobile } = useGlobal()

const show = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const title = computed(() => {
  return props.type === 'friend-link' ? '申请友情链接' : '申请收录导航站'
})

// 表单状态
const submitting = ref(false)
const fetchingSiteInfo = ref(false)
const showPreview = ref(false)

// 表单数据
const formData = ref({
  title: '',
  url: '',
  logo: '',
  description: '',
  categoryId: '',
  tags: [] as string[],
  contact: '',
})

// 表单引用
const formRef = ref()

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入网站标题', trigger: ['input', 'blur'] },
    { min: 1, max: 100, message: '标题长度应在1-100字符之间', trigger: ['input', 'blur'] },
  ],
  url: [
    { required: true, message: '请输入网站链接', trigger: ['input', 'blur'] },
    {
      validator: (_rule: any, value: string) => {
        if (!value)
          return true
        try {
          const url = new URL(value)
          if (!['http:', 'https:'].includes(url.protocol)) {
            return Promise.reject(new Error('URL必须以http://或https://开头'))
          }
          if (!url.hostname) {
            return Promise.reject(new Error('请输入有效的域名'))
          }
          return true
        }
        catch {
          return Promise.reject(new Error('请输入有效的URL格式'))
        }
      },
      trigger: ['input', 'blur'],
    },
  ],
  description: [
    { max: 500, message: '描述长度不能超过500字符', trigger: ['input', 'blur'] },
  ],
}

// 获取分类选项（仅导航站申请需要）
const { data: categories } = await useFetch<any[]>('/api/categories', {
  transform: (data: any) => data.data || [],
})

const categoryOptions = computed(() =>
  categories.value?.map(cat => ({
    label: cat.title,
    value: cat.id,
  })) || [],
)

// 自动格式化URL
function formatUrl(url: string): string {
  if (!url)
    return url
  url = url.trim()
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  return url
}

// 获取网站信息
async function fetchSiteInfo() {
  if (!formData.value.url) {
    message.warning('请先输入网站链接')
    return
  }

  fetchingSiteInfo.value = true
  try {
    const [siteResponse, faviconResponse] = await Promise.allSettled([
      $fetch<{ success: boolean, data: any }>('/api/utils/site-info', {
        query: { url: formData.value.url },
      }),
      $fetch<{ success: boolean, data: { url: string } }>('/api/utils/favicon', {
        query: { url: formData.value.url },
      }),
    ])

    if (siteResponse.status === 'fulfilled' && siteResponse.value.success) {
      const siteInfo = siteResponse.value.data
      if (siteInfo.title && !formData.value.title) {
        formData.value.title = siteInfo.title
      }
      if (siteInfo.description && !formData.value.description) {
        formData.value.description = siteInfo.description
      }
    }

    if (faviconResponse.status === 'fulfilled' && faviconResponse.value.success) {
      if (!formData.value.logo) {
        formData.value.logo = faviconResponse.value.data.url
      }
    }

    message.success('成功获取网站信息')
  }
  catch {
    message.error('获取网站信息失败')
  }
  finally {
    fetchingSiteInfo.value = false
  }
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const endpoint = props.type === 'friend-link'
      ? '/api/submissions/friend-links'
      : '/api/submissions/links'

    const response = await $fetch(endpoint, {
      method: 'POST',
      body: formData.value,
    })

    message.success(response.message || '申请提交成功！')
    show.value = false
    resetForm()
    emit('success')
  }
  catch (error: any) {
    message.error(error.data?.message || '申请提交失败')
  }
  finally {
    submitting.value = false
  }
}

// 重置表单
function resetForm() {
  formData.value = {
    title: '',
    url: '',
    logo: '',
    description: '',
    categoryId: '',
    tags: [],
    contact: '',
  }
}

// 监听URL输入变化
watch(() => formData.value.url, (newUrl) => {
  if (newUrl && newUrl !== formatUrl(newUrl)) {
    nextTick(() => {
      formData.value.url = formatUrl(newUrl)
    })
  }
})

// 监听模态框关闭
watch(show, (newShow) => {
  if (!newShow) {
    resetForm()
    showPreview.value = false
  }
})
</script>

<template>
  <n-modal
    v-model:show="show"
    preset="dialog"
    :title="title"
    :style="isMobile ? 'width: 95vw; max-width: 500px;' : 'width: 600px;'"
    :mask-closable="false"
  >
    <n-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-placement="isMobile ? 'top' : 'left'"
      label-width="auto"
      require-mark-placement="right-hanging"
      class="mt-4"
    >
      <n-form-item label="网站标题" path="title">
        <n-input
          v-model:value="formData.title"
          placeholder="请输入网站标题"
          maxlength="100"
          show-count
        />
      </n-form-item>

      <n-form-item label="网站链接" path="url">
        <div class="relative">
          <div v-if="isMobile" class="space-y-2">
            <n-input v-model:value="formData.url" placeholder="https://example.com" />
            <div class="flex flex-col gap-2">
              <n-button
                type="primary"
                ghost
                block
                :loading="fetchingSiteInfo"
                :disabled="!formData.url"
                @click="fetchSiteInfo"
              >
                <template #icon>
                  <i class="i-tabler-world-download" />
                </template>
                自动获取网站信息
              </n-button>
              <n-button
                type="default"
                ghost
                block
                :disabled="!formData.url"
                @click="showPreview = !showPreview"
              >
                <template #icon>
                  <i class="i-tabler-eye" />
                </template>
                预览网站
              </n-button>
            </div>
          </div>
          <n-input-group v-else>
            <n-input v-model:value="formData.url" placeholder="https://example.com" />
            <n-button
              type="primary"
              ghost
              :loading="fetchingSiteInfo"
              :disabled="!formData.url"
              @click="fetchSiteInfo"
            >
              <template #icon>
                <i class="i-tabler-world-download" />
              </template>
              获取信息
            </n-button>
            <n-button
              type="default"
              ghost
              :disabled="!formData.url"
              @click="showPreview = !showPreview"
            >
              <template #icon>
                <i class="i-tabler-eye" />
              </template>
              预览
            </n-button>
          </n-input-group>

          <!-- 网站预览组件 -->
          <WebsitePreview
            v-if="formData.url"
            v-model="showPreview"
            :url="formData.url"
          />
        </div>
      </n-form-item>

      <n-form-item label="网站图标" path="logo">
        <n-input v-model:value="formData.logo" placeholder="网站图标URL（可选，可通过获取信息自动填充）" />
      </n-form-item>

      <n-form-item label="网站描述" path="description">
        <n-input
          v-model:value="formData.description"
          type="textarea"
          placeholder="请简要描述网站的主要功能和特色"
          :autosize="{ minRows: 3, maxRows: 5 }"
          maxlength="500"
          show-count
        />
      </n-form-item>

      <!-- 导航站申请特有字段 -->
      <template v-if="type === 'link'">
        <n-form-item label="建议分类" path="categoryId">
          <n-select
            v-model:value="formData.categoryId"
            :options="categoryOptions"
            placeholder="选择最适合的分类（可选）"
            clearable
          />
        </n-form-item>

        <n-form-item label="标签">
          <n-dynamic-tags v-model:value="formData.tags" />
          <template #feedback>
            <div class="text-xs text-gray-500 mt-1">
              添加相关标签，有助于用户搜索发现
            </div>
          </template>
        </n-form-item>
      </template>

      <n-form-item label="联系方式" path="contact">
        <n-input
          v-model:value="formData.contact"
          placeholder="邮箱、QQ或其他联系方式（用于申请结果通知）"
        />
      </n-form-item>
    </n-form>

    <template #action>
      <div
        class="flex space-x-2"
        :class="isMobile ? 'flex-col space-y-2 space-x-0' : 'justify-end'"
      >
        <n-button
          :block="isMobile"
          @click="show = false"
        >
          取消
        </n-button>
        <n-button
          type="primary"
          :block="isMobile"
          :loading="submitting"
          @click="handleSubmit"
        >
          提交申请
        </n-button>
      </div>
    </template>
  </n-modal>
</template>
