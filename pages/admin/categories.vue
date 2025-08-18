<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '~/types/database'
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

// 导入导出相关状态
const isExporting = ref(false)
const isImporting = ref(false)
const showImportModal = ref(false)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement>()

const formRef = ref()
const formData = ref<CreateCategoryDto>({
  title: '',
  icon: '',
  order: 0,
})

const rules = {
  title: {
    required: true,
    message: '请输入分类标题',
  },
}

const { data: categories, refresh } = await useFetch<Category[]>('/api/categories', {
  transform: (data: any) => data.data || [],
})

const columns: DataTableColumns<Category> = [
  {
    title: '标题',
    key: 'title',
  },
  {
    title: '图标',
    key: 'icon',
    render: (row) => {
      if (!row.icon)
        return '-'

      if (isImageUrl(row.icon)) {
        return h('img', {
          src: getImageUrl(row.icon),
          class: 'w-6 h-6 object-contain',
          alt: '图标',
        })
      }
      return h(resolveComponent('TheIcon'), {
        icon: row.icon,
        class: 'w-6 h-6 text-lg',
      })
    },
  },
  {
    title: '排序',
    key: 'order',
  },
  {
    title: '创建时间',
    key: 'createdAt',
    render: row => new Date(row.createdAt).toLocaleDateString('zh-CN'),
  },
  {
    title: '操作',
    key: 'actions',
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

function handleEdit(category: Category) {
  editingId.value = category.id
  formData.value = {
    title: category.title,
    icon: category.icon,
    order: category.order,
  }
  showCreateModal.value = true
}

function handleDelete(id: string) {
  dialog.warning({
    title: '确认删除',
    content: '您确定要删除这个分类吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await $fetch(`/api/categories/${id}`, { method: 'DELETE' })
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
      await $fetch(`/api/categories/${editingId.value}`, {
        method: 'PUT',
        body: formData.value as UpdateCategoryDto,
      })
      message.success('更新成功')
    }
    else {
      await $fetch('/api/categories', {
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

function resetForm() {
  editingId.value = null
  formData.value = {
    title: '',
    icon: '',
    order: 0,
  }
}

watch(showCreateModal, (show) => {
  if (!show) {
    resetForm()
  }
})

// 导出分类数据
async function exportCategories() {
  try {
    isExporting.value = true

    const response = await fetch('/api/admin/categories/export')
    const blob = await response.blob()

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `categories-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    message.success('分类数据导出成功')
  }
  catch (error) {
    console.error('导出分类数据失败:', error)
    message.error('导出分类数据失败')
  }
  finally {
    isExporting.value = false
  }
}

// 选择导入文件
function selectImportFile() {
  fileInput.value?.click()
}

// 处理文件选择
function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0]
    showImportModal.value = true
  }
}

// 导入分类数据
async function importCategories() {
  if (!selectedFile.value) {
    message.error('请先选择要导入的文件')
    return
  }

  try {
    isImporting.value = true

    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await $fetch('/api/admin/categories/import', {
      method: 'POST',
      body: formData,
    })

    message.success(`导入完成！新增${response.statistics.imported}个，更新${response.statistics.updated}个，跳过${response.statistics.skipped}个`)

    if (response.errors && response.errors.length > 0) {
      dialog.info({
        title: '导入警告',
        content: `以下项目处理时出现问题：\n${response.errors.join('\n')}`,
      })
    }

    // 刷新数据
    await refresh()

    // 重置状态
    showImportModal.value = false
    selectedFile.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
  catch (error) {
    console.error('导入分类数据失败:', error)
    message.error(`导入分类数据失败: ${(error as any)?.data?.message || '未知错误'}`)
  }
  finally {
    isImporting.value = false
  }
}
</script>

<template>
  <NuxtLayout name="admin">
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">
          分类管理
        </h1>
        <div class="flex gap-2">
          <n-button :loading="isExporting" @click="exportCategories">
            <template #icon>
              <i class="i-tabler-download" />
            </template>
            导出分类
          </n-button>
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            style="display: none"
            @change="handleFileSelect"
          >
          <n-button @click="selectImportFile">
            <template #icon>
              <i class="i-tabler-upload" />
            </template>
            导入分类
          </n-button>
          <n-button type="primary" @click="showCreateModal = true">
            <template #icon>
              <i class="i-tabler-plus" />
            </template>
            添加分类
          </n-button>
        </div>
      </div>

      <n-card>
        <n-data-table
          :columns="columns"
          :data="categories"
          :loading="loading"
          :row-key="(row) => row.id"
        />
      </n-card>

      <!-- 创建/编辑分类模态框 -->
      <n-modal v-model:show="showCreateModal" preset="dialog" :title="editingId ? '编辑分类' : '创建分类'" style="width: 700px;">
        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-placement="left"
          label-width="auto"
        >
          <n-form-item label="分类标题" path="title">
            <n-input v-model:value="formData.title" placeholder="请输入分类标题" />
          </n-form-item>
          <n-form-item label="图标" path="icon">
            <IconPicker v-model="formData.icon" />
          </n-form-item>
          <n-form-item label="排序" path="order">
            <n-input-number v-model:value="formData.order" :min="0" placeholder="排序值" />
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

      <!-- 导入确认模态框 -->
      <n-modal v-model:show="showImportModal" preset="dialog" title="确认导入分类数据" style="width: 500px;">
        <div class="space-y-4">
          <n-alert type="warning" show-icon>
            <template #header>
              注意事项
            </template>
            <ul class="list-disc list-inside space-y-1 text-sm">
              <li>导入操作会根据ID或标题更新现有分类</li>
              <li>如果分类不存在，将创建新的分类</li>
              <li>请确保JSON文件格式正确</li>
            </ul>
          </n-alert>

          <div v-if="selectedFile" class="bg-gray-50 p-3 rounded">
            <div class="text-sm text-gray-600">
              选择的文件：
            </div>
            <div class="font-medium">
              {{ selectedFile.name }}
            </div>
            <div class="text-xs text-gray-500">
              大小：{{ (selectedFile.size / 1024).toFixed(1) }} KB
            </div>
          </div>
        </div>

        <template #action>
          <div class="flex gap-2">
            <n-button @click="showImportModal = false">
              取消
            </n-button>
            <n-button type="primary" :loading="isImporting" @click="importCategories">
              确认导入
            </n-button>
          </div>
        </template>
      </n-modal>
    </div>
  </NuxtLayout>
</template>
