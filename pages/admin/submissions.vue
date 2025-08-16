<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { FriendLinkSubmission, LinkSubmission } from '~/types/database'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

const message = useMessage()
const dialog = useDialog()

// 数据状态
const loading = ref(false)
const friendLinkSubmissions = ref<FriendLinkSubmission[]>([])
const linkSubmissions = ref<LinkSubmission[]>([])
const currentTab = ref('friend-links')

// 筛选状态
const statusFilter = ref('all')
const searchKeyword = ref('')
const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
]

// 原始数据（用于筛选）
const originalFriendLinkSubmissions = ref<FriendLinkSubmission[]>([])
const originalLinkSubmissions = ref<LinkSubmission[]>([])

// 分页配置
const pagination = {
  pageSize: 10,
}

// 友链申请表格列
const friendLinkColumns: DataTableColumns<FriendLinkSubmission> = [
  {
    title: '网站标题',
    key: 'title',
    width: 150,
  },
  {
    title: '网站链接',
    key: 'url',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
    render(row) {
      return h('a', {
        href: row.url,
        target: '_blank',
        class: 'text-blue-500 hover:underline',
      }, row.url)
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
    title: '联系方式',
    key: 'contact',
    width: 120,
    ellipsis: {
      tooltip: true,
    },
    render(row) {
      return row.contact || '无'
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row) {
      const statusMap = {
        pending: { type: 'warning', text: '待审核' },
        approved: { type: 'success', text: '已通过' },
        rejected: { type: 'error', text: '已拒绝' },
      }
      const status = statusMap[row.status as keyof typeof statusMap]
      return h('n-tag', { type: status.type, size: 'small' }, { default: () => status.text })
    },
  },
  {
    title: '提交时间',
    key: 'createdAt',
    width: 160,
    render(row) {
      return new Date(row.createdAt).toLocaleString('zh-CN')
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render(row) {
      if (row.status === 'pending') {
        return h('div', { class: 'flex gap-1' }, [
          h('n-button', {
            size: 'small',
            type: 'success',
            onClick: () => handleApprove('friend-link', row.id, row.title),
          }, '通过'),
          h('n-button', {
            size: 'small',
            type: 'error',
            onClick: () => handleReject('friend-link', row.id, row.title),
          }, '拒绝'),
        ])
      }
      return h('span', { class: 'text-gray-400 text-sm' }, '已审核')
    },
  },
]

// 导航站申请表格列
const linkColumns: DataTableColumns<LinkSubmission> = [
  {
    title: '网站标题',
    key: 'title',
    width: 120,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '网站链接',
    key: 'url',
    width: 180,
    ellipsis: {
      tooltip: true,
    },
    render(row) {
      return h('a', {
        href: row.url,
        target: '_blank',
        class: 'text-blue-500 hover:underline',
      }, row.url)
    },
  },
  {
    title: '图标',
    key: 'logo',
    width: 60,
    render(row) {
      return row.logo
        ? h('img', {
            src: row.logo,
            alt: row.title,
            style: { width: '24px', height: '24px', objectFit: 'contain' },
          })
        : h('span', '无')
    },
  },
  {
    title: '描述',
    key: 'description',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
    render(row) {
      return row.description || '无'
    },
  },
  {
    title: '标签',
    key: 'tags',
    width: 120,
    render(row) {
      if (!row.tags || row.tags.length === 0)
        return h('span', '无')
      // 只显示前2个标签，其余用...表示
      const displayTags = row.tags.slice(0, 2)
      const hasMore = row.tags.length > 2
      return h('div', { class: 'flex flex-wrap gap-1' }, [
        ...displayTags.map(tag => h('n-tag', { size: 'small' }, { default: () => tag })),
        hasMore && h('span', { class: 'text-gray-400 text-xs' }, `+${row.tags.length - 2}`),
      ])
    },
  },
  {
    title: '联系方式',
    key: 'contact',
    width: 100,
    ellipsis: {
      tooltip: true,
    },
    render(row) {
      return row.contact || '无'
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render(row) {
      const statusMap = {
        pending: { type: 'warning', text: '待审核' },
        approved: { type: 'success', text: '已通过' },
        rejected: { type: 'error', text: '已拒绝' },
      }
      const status = statusMap[row.status as keyof typeof statusMap]
      return h('n-tag', { type: status.type, size: 'small' }, { default: () => status.text })
    },
  },
  {
    title: '提交时间',
    key: 'createdAt',
    width: 120,
    render(row) {
      return new Date(row.createdAt).toLocaleDateString('zh-CN')
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render(row) {
      if (row.status === 'pending') {
        return h('div', { class: 'flex gap-1' }, [
          h('n-button', {
            size: 'small',
            type: 'success',
            onClick: () => handleApprove('link', row.id, row.title),
          }, '通过'),
          h('n-button', {
            size: 'small',
            type: 'error',
            onClick: () => handleReject('link', row.id, row.title),
          }, '拒绝'),
        ])
      }
      return h('span', { class: 'text-gray-400 text-sm' }, '已审核')
    },
  },
]

// 获取申请数据
async function fetchSubmissions() {
  loading.value = true
  try {
    // 不在API层面进行状态筛选，而是获取所有数据然后前端筛选
    const response = await $fetch<{ success: boolean, data: any }>('/api/admin/submissions')

    if (response.success) {
      originalFriendLinkSubmissions.value = response.data.friendLinks || []
      originalLinkSubmissions.value = response.data.links.map((item: any) => ({
        ...item,
        tags: item.tags ? JSON.parse(item.tags) : [],
      })) || []

      // 应用筛选
      applyFilters()
    }
  }
  catch {
    message.error('获取申请数据失败')
  }
  finally {
    loading.value = false
  }
}

// 应用筛选条件
function applyFilters() {
  // 筛选友情链接申请
  let filteredFriendLinks = [...originalFriendLinkSubmissions.value]

  // 状态筛选
  if (statusFilter.value !== 'all') {
    filteredFriendLinks = filteredFriendLinks.filter(item => item.status === statusFilter.value)
  }

  // 关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    filteredFriendLinks = filteredFriendLinks.filter(item =>
      item.title.toLowerCase().includes(keyword)
      || item.url.toLowerCase().includes(keyword)
      || (item.description && item.description.toLowerCase().includes(keyword))
      || (item.contact && item.contact.toLowerCase().includes(keyword)),
    )
  }

  friendLinkSubmissions.value = filteredFriendLinks

  // 筛选导航站申请
  let filteredLinks = [...originalLinkSubmissions.value]

  // 状态筛选
  if (statusFilter.value !== 'all') {
    filteredLinks = filteredLinks.filter(item => item.status === statusFilter.value)
  }

  // 关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    filteredLinks = filteredLinks.filter(item =>
      item.title.toLowerCase().includes(keyword)
      || item.url.toLowerCase().includes(keyword)
      || (item.description && item.description.toLowerCase().includes(keyword))
      || (item.contact && item.contact.toLowerCase().includes(keyword))
      || (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(keyword))),
    )
  }

  linkSubmissions.value = filteredLinks
}

// 重置筛选条件
function resetFilters() {
  statusFilter.value = 'all'
  searchKeyword.value = ''
  applyFilters()
}

// 处理通过申请
function handleApprove(type: 'friend-link' | 'link', id: string, title: string) {
  dialog.info({
    title: '确认通过申请',
    content: `确定要通过「${title}」的申请吗？通过后将自动添加到对应的列表中。`,
    positiveText: '确认通过',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const endpoint = type === 'friend-link'
          ? `/api/admin/submissions/friend-links/${id}`
          : `/api/admin/submissions/links/${id}`

        await $fetch(endpoint, {
          method: 'PUT',
          body: { status: 'approved' },
        })

        message.success('申请已通过')
        await fetchSubmissions()
      }
      catch {
        message.error('操作失败')
      }
    },
  })
}

// 处理拒绝申请
function handleReject(type: 'friend-link' | 'link', id: string, title: string) {
  dialog.create({
    title: '拒绝申请',
    content: () => h('div', [
      h('p', `确定要拒绝「${title}」的申请吗？`),
      h('n-input', {
        placeholder: '请输入拒绝原因（可选）',
        type: 'textarea',
        rows: 3,
        style: 'margin-top: 12px;',
        onInput: (value: string) => {
          rejectReason.value = value
        },
      }),
    ]),
    positiveText: '确认拒绝',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const endpoint = type === 'friend-link'
          ? `/api/admin/submissions/friend-links/${id}`
          : `/api/admin/submissions/links/${id}`

        await $fetch(endpoint, {
          method: 'PUT',
          body: {
            status: 'rejected',
            reason: rejectReason.value,
          },
        })

        message.success('申请已拒绝')
        rejectReason.value = ''
        await fetchSubmissions()
      }
      catch {
        message.error('操作失败')
      }
    },
  })
}

const rejectReason = ref('')

// 监听筛选条件变化
watch([statusFilter, searchKeyword], () => {
  applyFilters()
})

// 页面加载时获取数据
await fetchSubmissions()
</script>

<template>
  <NuxtLayout name="admin">
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">
          申请审核管理
        </h1>
        <div class="flex items-center space-x-4">
          <n-input
            v-model:value="searchKeyword"
            placeholder="搜索标题、链接、描述..."
            style="width: 240px;"
            clearable
          >
            <template #prefix>
              <i class="i-tabler-search" />
            </template>
          </n-input>

          <n-select
            v-model:value="statusFilter"
            :options="statusOptions"
            style="width: 120px;"
          />

          <n-button quaternary @click="resetFilters()">
            <template #icon>
              <i class="i-tabler-filter-off" />
            </template>
            重置
          </n-button>

          <n-button :loading="loading" @click="fetchSubmissions()">
            <template #icon>
              <i class="i-tabler-refresh" />
            </template>
            刷新
          </n-button>
        </div>
      </div>

      <n-tabs v-model:value="currentTab" type="line">
        <n-tab-pane name="friend-links" tab="友情链接申请">
          <n-card>
            <template #header>
              <div class="flex items-center justify-between">
                <span>友情链接申请列表</span>
                <div class="flex items-center space-x-2">
                  <n-tag v-if="searchKeyword || statusFilter !== 'all'" type="info" size="small">
                    筛选结果: {{ friendLinkSubmissions.length }} 条
                  </n-tag>
                  <n-tag v-if="originalFriendLinkSubmissions.length > 0" size="small">
                    总计: {{ originalFriendLinkSubmissions.length }} 条
                  </n-tag>
                </div>
              </div>
            </template>

            <n-data-table
              :columns="friendLinkColumns"
              :data="friendLinkSubmissions"
              :loading="loading"
              :pagination="pagination"
              :row-key="(row) => row.id"
              :scroll-x="1200"
              striped
              :single-line="false"
            />

            <n-empty
              v-if="!loading && friendLinkSubmissions.length === 0 && (searchKeyword || statusFilter !== 'all')"
              description="没有找到符合条件的友情链接申请"
              style="margin: 40px 0;"
            >
              <template #extra>
                <n-button type="primary" @click="resetFilters()">
                  清除筛选条件
                </n-button>
              </template>
            </n-empty>
          </n-card>
        </n-tab-pane>

        <n-tab-pane name="links" tab="导航站申请">
          <n-card>
            <template #header>
              <div class="flex items-center justify-between">
                <span>导航站申请列表</span>
                <div class="flex items-center space-x-2">
                  <n-tag v-if="searchKeyword || statusFilter !== 'all'" type="info" size="small">
                    筛选结果: {{ linkSubmissions.length }} 条
                  </n-tag>
                  <n-tag v-if="originalLinkSubmissions.length > 0" size="small">
                    总计: {{ originalLinkSubmissions.length }} 条
                  </n-tag>
                </div>
              </div>
            </template>

            <n-data-table
              :columns="linkColumns"
              :data="linkSubmissions"
              :loading="loading"
              :pagination="pagination"
              :row-key="(row) => row.id"
              :scroll-x="1200"
              striped
              :single-line="false"
            />

            <n-empty
              v-if="!loading && linkSubmissions.length === 0 && (searchKeyword || statusFilter !== 'all')"
              description="没有找到符合条件的导航站申请"
              style="margin: 40px 0;"
            >
              <template #extra>
                <n-button type="primary" @click="resetFilters()">
                  清除筛选条件
                </n-button>
              </template>
            </n-empty>
          </n-card>
        </n-tab-pane>
      </n-tabs>
    </div>
  </NuxtLayout>
</template>
