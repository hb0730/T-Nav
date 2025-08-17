<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { Category, CreateLinkDto, Link, UpdateLinkDto } from '~/types/database'
import { getImageUrl, isImageUrl } from '~/composables/useImageUtils'

definePageMeta({
  layout: false,
})

const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const submitting = ref(false)
const showCreateModal = ref(false)
const editingId = ref<string | null>(null)
const selectedCategory = ref<string | null>(null)
const fetchingLogo = ref(false)
const fetchingSiteInfo = ref(false)
const showPreview = ref(false)

const pagination = {
  pageSize: 10,
}

const formRef = ref()
const formData = ref<CreateLinkDto>({
  title: '',
  url: '',
  categoryId: '',
  logo: '',
  description: '',
  tags: [],
  order: 0,
  deprecated: false,
})

const rules = {
  title: {
    required: true,
    message: '请输入链接标题',
    trigger: ['input', 'blur'],
  },
  url: [
    { required: true, message: '请输入链接地址', trigger: ['input', 'blur'] },
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
  categoryId: {
    required: true,
    message: '请选择分类',
    trigger: ['change', 'blur'],
  },
}

const { data: categories } = await useFetch<Category[]>('/api/categories', {
  transform: (data: any) => data.data || [],
})

const { data: links, refresh } = await useFetch<Link[]>('/api/links', {
  transform: (data: any) => data.data || [],
})

const categoryOptions = computed(() => [
  { label: '全部分类', value: null },
  ...(categories.value?.map(cat => ({
    label: cat.title,
    value: cat.id,
  })) || []),
])

const filteredLinks = computed(() => {
  if (!selectedCategory.value)
    return links.value || []
  return (links.value || []).filter(link => link.categoryId === selectedCategory.value)
})

function getCategoryName(categoryId: string) {
  const category = categories.value?.find(cat => cat.id === categoryId)
  return category?.title || '未知分类'
}

const columns: DataTableColumns<Link> = [
  {
    title: '标题',
    key: 'title',
    width: 150,
  },
  {
    title: 'Logo',
    key: 'logo',
    width: 80,
    render: (row) => {
      if (!row.logo)
        return '-'

      if (isImageUrl(row.logo)) {
        return h('img', {
          src: getImageUrl(row.logo),
          class: 'w-6 h-6 object-contain',
          alt: 'Logo',
        })
      }
      return h(resolveComponent('TheIcon'), {
        icon: row.logo,
        class: 'w-6 h-6 text-lg',
      })
    },
  },
  {
    title: '链接',
    key: 'url',
    width: 200,
    render: row => h('a', {
      href: row.url,
      target: '_blank',
      class: 'text-blue-500 hover:underline',
    }, row.url),
  },
  {
    title: '分类',
    key: 'categoryId',
    width: 120,
    render: row => getCategoryName(row.categoryId),
  },
  {
    title: '标签',
    key: 'tags',
    width: 150,
    render: (row) => {
      if (!row.tags?.length)
        return '-'
      return h('div', { class: 'flex flex-wrap gap-1' }, row.tags.map(tag =>
        h(resolveComponent('n-tag'), { size: 'small' }, { default: () => tag }),
      ))
    },
  },
  {
    title: '状态',
    key: 'deprecated',
    width: 80,
    render: row => h(
      resolveComponent('n-tag'),
      { type: row.deprecated ? 'error' : 'success', size: 'small' },
      { default: () => row.deprecated ? '已废弃' : '正常' },
    ),
  },
  {
    title: '排序',
    key: 'order',
    width: 80,
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: (row) => {
      return h('div', { class: 'flex gap-2' }, [
        h(
          resolveComponent('n-button'),
          {
            size: 'small',
            onClick: () => handleEdit(row),
          },
          { default: () => '编辑' },
        ),
        h(
          resolveComponent('n-button'),
          {
            size: 'small',
            type: 'error',
            onClick: () => handleDelete(row.id),
          },
          { default: () => '删除' },
        ),
      ])
    },
  },
]

function handleCategoryFilter() {
  // 筛选逻辑已通过 computed 实现
}

function handleEdit(link: Link) {
  editingId.value = link.id
  formData.value = {
    title: link.title,
    url: link.url,
    categoryId: link.categoryId,
    logo: link.logo,
    description: link.description,
    tags: link.tags || [],
    order: link.order,
    deprecated: link.deprecated || false,
  }
  showCreateModal.value = true
}

function handleDelete(id: string) {
  dialog.warning({
    title: '确认删除',
    content: '您确定要删除这个链接吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await $fetch(`/api/links/${id}`, { method: 'DELETE' })
        message.success('删除成功')
        refresh()
      }
      catch (error: any) {
        message.error(error.data?.message || '删除失败')
      }
    },
  })
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true

    if (editingId.value) {
      await $fetch(`/api/links/${editingId.value}`, {
        method: 'PUT',
        body: formData.value as UpdateLinkDto,
      })
      message.success('更新成功')
    }
    else {
      await $fetch('/api/links', {
        method: 'POST',
        body: formData.value,
      })
      message.success('创建成功')
    }

    showCreateModal.value = false
    resetForm()
    refresh()
  }
  catch (error: any) {
    message.error(error.data?.message || '操作失败')
  }
  finally {
    submitting.value = false
  }
}

// 获取网站favicon
async function fetchFavicon() {
  if (!formData.value.url) {
    message.warning('请先输入链接地址')
    return
  }

  fetchingLogo.value = true
  try {
    const response = await $fetch<{ success: boolean, data: { url: string, fallback?: boolean } }>('/api/utils/favicon', {
      query: { url: formData.value.url },
    })

    if (response.success && response.data.url) {
      formData.value.logo = response.data.url
      if (response.data.fallback) {
        message.info('使用默认图标服务获取logo')
      }
      else {
        message.success('成功获取网站logo')
      }
    }
    else {
      message.error('获取网站logo失败')
    }
  }
  catch {
    message.error('获取网站logo失败')
  }
  finally {
    fetchingLogo.value = false
  }
}

// 获取网站信息（标题、描述、logo）
async function fetchSiteInfo() {
  if (!formData.value.url) {
    message.warning('请先输入链接地址')
    return
  }

  fetchingSiteInfo.value = true
  try {
    const response = await $fetch<{ success: boolean, data: { title: string, description: string } }>('/api/utils/site-info', {
      query: { url: formData.value.url },
    })

    if (response.success && response.data) {
      if (response.data.title && !formData.value.title) {
        formData.value.title = response.data.title
      }
      if (response.data.description && !formData.value.description) {
        formData.value.description = response.data.description
      }

      // 同时获取logo
      if (!formData.value.logo) {
        await fetchFavicon()
      }

      message.success('成功获取网站信息')
    }
    else {
      message.error('获取网站信息失败')
    }
  }
  catch {
    message.error('获取网站信息失败')
  }
  finally {
    fetchingSiteInfo.value = false
  }
}

// 自动格式化URL
function formatUrl(url: string): string {
  if (!url)
    return url

  // 移除首尾空格
  url = url.trim()

  // 如果没有协议，自动添加https://
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }

  return url
}

function resetForm() {
  editingId.value = null
  formData.value = {
    title: '',
    url: '',
    categoryId: '',
    logo: '',
    description: '',
    tags: [],
    order: 0,
    deprecated: false,
  }
}

watch(showCreateModal, (show) => {
  if (!show) {
    resetForm()
  }
})

// 监听URL输入，自动格式化
watch(() => formData.value.url, (newUrl) => {
  if (newUrl && newUrl !== formatUrl(newUrl)) {
    nextTick(() => {
      formData.value.url = formatUrl(newUrl)
    })
  }
})
</script>

<template>
  <NuxtLayout name="admin">
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">
          链接管理
        </h1>
        <n-button type="primary" @click="showCreateModal = true">
          <template #icon>
            <i class="i-tabler-plus" />
          </template>
          添加链接
        </n-button>
      </div>

      <n-card>
        <template #header>
          <div class="flex items-center gap-4">
            <n-select
              v-model:value="selectedCategory"
              :options="categoryOptions"
              placeholder="选择分类筛选"
              clearable
              class="w-48"
              @update:value="handleCategoryFilter"
            />
          </div>
        </template>

        <n-data-table
          :columns="columns"
          :data="filteredLinks"
          :loading="loading"
          :row-key="(row) => row.id"
          :pagination="pagination"
        />
      </n-card>

      <!-- 创建/编辑链接模态框 -->
      <n-modal v-model:show="showCreateModal" preset="dialog" :title="editingId ? '编辑链接' : '创建链接'" style="width: 800px;">
        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-placement="left"
          label-width="80px"
        >
          <n-form-item label="标题" path="title">
            <n-input v-model:value="formData.title" placeholder="请输入链接标题" maxlength="100" show-count />
          </n-form-item>
          <n-form-item label="链接地址" path="url">
            <div class="relative">
              <n-input-group>
                <n-input v-model:value="formData.url" placeholder="https://example.com" />
                <n-button
                  type="primary"
                  ghost
                  :loading="fetchingSiteInfo"
                  :disabled="!formData.url"
                  style="width: 120px;"
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
          <n-form-item label="分类" path="categoryId">
            <n-select
              v-model:value="formData.categoryId"
              :options="categoryOptions"
              placeholder="选择分类"
            />
          </n-form-item>
          <n-form-item label="Logo">
            <div class="flex gap-2">
              <div class="flex-1">
                <IconPicker v-model="formData.logo" />
              </div>
              <n-button
                type="primary"
                ghost
                :loading="fetchingLogo"
                :disabled="!formData.url"
                style="width: 100px;"
                @click="fetchFavicon"
              >
                <template #icon>
                  <i class="i-tabler-download" />
                </template>
                获取logo
              </n-button>
            </div>
          </n-form-item>
          <n-form-item label="描述">
            <n-input
              v-model:value="formData.description"
              type="textarea"
              placeholder="请输入描述"
              :rows="3"
              maxlength="500"
              show-count
            />
          </n-form-item>
          <n-form-item label="标签">
            <n-dynamic-tags v-model:value="formData.tags" />
            <template #feedback>
              <div class="text-xs text-gray-500 mt-1">
                按回车键添加标签，用于搜索和分类
              </div>
            </template>
          </n-form-item>
          <n-form-item label="排序">
            <n-input-number
              v-model:value="formData.order"
              :min="0"
              :max="9999"
              :step="1"
              placeholder="排序值"
            />
            <template #feedback>
              <div class="text-xs text-gray-500 mt-1">
                数字越小排序越靠前，相同数字按创建时间排序
              </div>
            </template>
          </n-form-item>
          <n-form-item label="状态">
            <n-switch v-model:value="formData.deprecated">
              <template #checked>
                已废弃
              </template>
              <template #unchecked>
                正常
              </template>
            </n-switch>
          </n-form-item>
        </n-form>
        <template #action>
          <div class="flex gap-2">
            <n-button @click="showCreateModal = false">
              取消
            </n-button>
            <n-button type="primary" :loading="submitting" @click="handleSubmit">
              {{ editingId ? '更新' : '创建' }}
            </n-button>
          </div>
        </template>
      </n-modal>
    </div>
  </NuxtLayout>
</template>
