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
</script>

<template>
  <NuxtLayout name="admin">
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">
          分类管理
        </h1>
        <n-button type="primary" @click="showCreateModal = true">
          <template #icon>
            <i class="i-tabler-plus" />
          </template>
          添加分类
        </n-button>
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
    </div>
  </NuxtLayout>
</template>
