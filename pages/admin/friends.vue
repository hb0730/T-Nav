<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { FriendLink } from '~/types/database'

// 页面权限检查
definePageMeta({
  layout: false,
  middleware: 'auth',
})

const message = useMessage()
const dialog = useDialog()

// 数据状态
const friendLinks = ref<FriendLink[]>([])
const loading = ref(false)
const submitting = ref(false)
const showAddModal = ref(false)
const editingFriendLink = ref<FriendLink | null>(null)
const fetchingLogo = ref(false)
const fetchingSiteInfo = ref(false)
const showPreview = ref(false)

// 表单数据
const formData = ref({
  title: '',
  url: '',
  logo: '',
  description: '',
  order: 0,
})

// 表单引用
const formRef = ref()

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入友情链接标题', trigger: ['input', 'blur'] },
    { min: 1, max: 100, message: '标题长度应在1-100字符之间', trigger: ['input', 'blur'] },
  ],
  url: [
    { required: true, message: '请输入友情链接URL', trigger: ['input', 'blur'] },
    {
      validator: (_rule: any, value: string) => {
        if (!value)
          return true
        try {
          const url = new URL(value)
          // 检查协议
          if (!['http:', 'https:'].includes(url.protocol)) {
            return Promise.reject(new Error('URL必须以http://或https://开头'))
          }
          // 检查域名
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
  logo: [
    {
      validator: (_rule: any, value: string) => {
        if (!value)
          return true // 可选字段
        try {
          // 验证URL但不创建对象（避免side effect）
          const url = new URL(value)
          if (!url.hostname) {
            return Promise.reject(new Error('请输入有效的域名'))
          }
          return true
        }
        catch {
          return Promise.reject(new Error('请输入有效的图标URL'))
        }
      },
      trigger: ['input', 'blur'],
    },
  ],
  description: [
    { max: 500, message: '描述长度不能超过500字符', trigger: ['input', 'blur'] },
  ],
  order: [
    { type: 'number', min: 0, max: 9999, message: '排序值应在0-9999之间', trigger: ['input', 'blur'] },
  ],
}

// 分页配置
const pagination = {
  pageSize: 10,
}

// 表格列配置
const columns: DataTableColumns<FriendLink> = [
  {
    title: '标题',
    key: 'title',
    width: 150,
  },
  {
    title: '链接',
    key: 'url',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '图标',
    key: 'logo',
    width: 80,
    render(row) {
      return row.logo
        ? h('img', {
            src: row.logo,
            alt: row.title,
            style: { width: '32px', height: '32px', objectFit: 'contain' },
          })
        : h('span', '无')
    },
  },
  {
    title: '描述',
    key: 'description',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
    render(row) {
      return row.description || '无'
    },
  },
  {
    title: '排序',
    key: 'order',
    width: 80,
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 160,
    render(row) {
      return new Date(row.createdAt).toLocaleString('zh-CN')
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render(row) {
      return h('div', { class: 'flex space-x-2' }, [
        h(
          'n-button',
          {
            size: 'small',
            type: 'primary',
            ghost: true,
            onClick: () => handleEdit(row),
          },
          '编辑',
        ),
        h(
          'n-button',
          {
            size: 'small',
            type: 'error',
            ghost: true,
            onClick: () => handleDelete(row),
          },
          '删除',
        ),
      ])
    },
  },
]

// 获取友情链接列表
async function fetchFriendLinks() {
  loading.value = true
  try {
    const response = await $fetch<{ success: boolean, data: FriendLink[] }>('/api/friends')
    if (response.success) {
      friendLinks.value = response.data
    }
  }
  catch {
    message.error('获取友情链接失败')
  }
  finally {
    loading.value = false
  }
}

// 重置表单
function resetForm() {
  formData.value = {
    title: '',
    url: '',
    logo: '',
    description: '',
    order: 0,
  }
  editingFriendLink.value = null
}

// 处理提交
async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true

    if (editingFriendLink.value) {
      // 更新友情链接
      await $fetch(`/api/friends/${editingFriendLink.value.id}`, {
        method: 'PUT',
        body: formData.value,
      })
      message.success('友情链接更新成功')
    }
    else {
      // 添加友情链接
      await $fetch('/api/friends', {
        method: 'POST',
        body: formData.value,
      })
      message.success('友情链接添加成功')
    }

    showAddModal.value = false
    resetForm()
    await fetchFriendLinks()
  }
  catch {
    message.error(editingFriendLink.value ? '更新友情链接失败' : '添加友情链接失败')
  }
  finally {
    submitting.value = false
  }
}

// 处理编辑
function handleEdit(friendLink: FriendLink) {
  editingFriendLink.value = friendLink
  formData.value = {
    title: friendLink.title,
    url: friendLink.url,
    logo: friendLink.logo || '',
    description: friendLink.description || '',
    order: friendLink.order,
  }
  showAddModal.value = true
}

// 获取网站favicon
async function fetchFavicon() {
  if (!formData.value.url) {
    message.warning('请先输入链接URL')
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
    message.warning('请先输入链接URL')
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

// 处理删除
function handleDelete(friendLink: FriendLink) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除友情链接「${friendLink.title}」吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await $fetch(`/api/friends/${friendLink.id}`, {
          method: 'DELETE',
        })
        message.success('友情链接删除成功')
        await fetchFriendLinks()
      }
      catch {
        message.error('删除友情链接失败')
      }
    },
  })
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

// 监听URL输入，自动格式化
watch(() => formData.value.url, (newUrl) => {
  if (newUrl && newUrl !== formatUrl(newUrl)) {
    nextTick(() => {
      formData.value.url = formatUrl(newUrl)
    })
  }
})
watch(showAddModal, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

// 页面加载时获取数据
await fetchFriendLinks()
</script>

<template>
  <NuxtLayout name="admin">
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">
          友情链接管理
        </h1>
        <n-button type="primary" @click="showAddModal = true">
          <template #icon>
            <i class="i-tabler-plus" />
          </template>
          添加友情链接
        </n-button>
      </div>

      <n-card>
        <n-data-table
          :columns="columns"
          :data="friendLinks"
          :loading="loading"
          :pagination="pagination"
        />
      </n-card>

      <!-- 添加/编辑模态框 -->
      <n-modal v-model:show="showAddModal" preset="dialog" :title="editingFriendLink ? '编辑友情链接' : '添加友情链接'" style="width: 700px;">
        <n-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-placement="left"
          label-width="auto"
          require-mark-placement="right-hanging"
          class="mt-4"
        >
          <n-form-item label="标题" path="title">
            <n-input
              v-model:value="formData.title"
              placeholder="请输入友情链接标题"
              maxlength="100"
              show-count
            />
          </n-form-item>
          <n-form-item label="链接" path="url">
            <div class="relative">
              <n-input-group>
                <n-input v-model:value="formData.url" placeholder="请输入友情链接URL" />
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
          <n-form-item label="图标" path="logo">
            <n-input-group>
              <n-input v-model:value="formData.logo" placeholder="请输入图标URL（可选）" />
              <n-button
                type="primary"
                ghost
                :loading="fetchingLogo"
                :disabled="!formData.url"
                @click="fetchFavicon"
              >
                <template #icon>
                  <i class="i-tabler-download" />
                </template>
                获取
              </n-button>
            </n-input-group>
          </n-form-item>
          <n-form-item label="描述" path="description">
            <n-input
              v-model:value="formData.description"
              type="textarea"
              placeholder="请输入友情链接描述（可选）"
              :autosize="{ minRows: 3, maxRows: 5 }"
              maxlength="500"
              show-count
            />
          </n-form-item>
          <n-form-item label="排序" path="order">
            <n-input-number
              v-model:value="formData.order"
              placeholder="排序权重，数字越小越靠前"
              :min="0"
              :max="9999"
              :step="1"
            />
            <template #feedback>
              <div class="text-xs text-gray-500 mt-1">
                数字越小排序越靠前，相同数字按创建时间排序
              </div>
            </template>
          </n-form-item>
        </n-form>
        <template #action>
          <div class="flex justify-end space-x-2">
            <n-button @click="showAddModal = false">
              取消
            </n-button>
            <n-button type="primary" :loading="submitting" @click="handleSubmit">
              {{ editingFriendLink ? '更新' : '添加' }}
            </n-button>
          </div>
        </template>
      </n-modal>
    </div>
  </NuxtLayout>
</template>
