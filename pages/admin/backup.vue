<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const isExportingData = ref(false)
const isRestoringData = ref(false)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement>()

async function exportData() {
  try {
    isExportingData.value = true

    // 直接下载数据导出文件
    const response = await fetch('/api/admin/backup/export-data')
    const blob = await response.blob()

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `data-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
  catch (error) {
    console.error('导出数据失败:', error)
    alert(`导出数据失败: ${(error as any)?.message}` || '未知错误')
  }
  finally {
    isExportingData.value = false
  }
}

function selectFile() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0]
  }
}

async function restoreData() {
  if (!selectedFile.value) {
    alert('请先选择要恢复的JSON数据文件')
    return
  }

  const confirmed = confirm(
    '确定要恢复数据吗？\n\n注意：\n1. 请确保选择的是通过"数据导出"功能生成的JSON文件\n2. 这将清空现有的分类、链接、友情链接等数据（不包括用户数据）\n3. 此操作不可撤销！',
  )

  if (!confirmed)
    return

  try {
    isRestoringData.value = true

    const formData = new FormData()
    formData.append('file', selectedFile.value)

    await $fetch('/api/admin/backup/restore', {
      method: 'POST',
      body: formData,
    })

    alert('数据恢复成功！页面将刷新以显示最新数据。')
    // 刷新页面
    window.location.reload()
  }
  catch (error) {
    console.error('恢复数据失败:', error)
    alert(`恢复数据失败: ${(error as any)?.data?.message}` || '未知错误')
  }
  finally {
    isRestoringData.value = false
  }
}
</script>

<template>
  <div class="admin-backup">
    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-2">
        备份管理
      </h1>
      <p class="text-gray-600">
        管理站点备份文件，支持完整备份和数据导出
      </p>
    </div>

    <!-- 数据恢复 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">
        数据恢复
      </h2>
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="i-tabler-alert-triangle text-yellow-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">
              使用说明
            </h3>
            <div class="mt-2 text-sm text-yellow-700">
              <ul class="list-disc list-inside space-y-1">
                <li>请使用下方"数据导出"功能生成的JSON文件进行恢复</li>
                <li>恢复操作将清空现有的分类、链接、友情链接等数据（不包括用户数据）</li>
                <li>此操作不可撤销，请确保已备份重要数据</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleFileSelect"
        >
        <button
          class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          @click="selectFile"
        >
          选择导出的JSON数据文件
        </button>
        <span v-if="selectedFile" class="text-sm text-gray-600">
          已选择: {{ selectedFile.name }}
        </span>
        <button
          v-if="selectedFile"
          :disabled="isRestoringData"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          @click="restoreData"
        >
          {{ isRestoringData ? '恢复中...' : '确认恢复' }}
        </button>
      </div>
    </div>

    <!-- 数据导出 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">
        数据导出
      </h2>

      <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="i-tabler-info-circle text-green-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">
              关于数据导出
            </h3>
            <div class="mt-2 text-sm text-green-700">
              <p>导出站点的所有业务数据（分类、链接、友情链接等），导出的JSON文件可用于数据迁移和恢复。</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center">
        <button
          :disabled="isExportingData"
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2 text-lg"
          @click="exportData"
        >
          <i class="i-tabler-database-export text-xl" />
          <span>{{ isExportingData ? '导出中...' : '导出数据' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
