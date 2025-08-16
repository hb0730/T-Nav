<script setup lang="ts">
import type { SiteConfig, UpdateSiteConfigDto } from '~/types/database'

definePageMeta({
  middleware: 'auth',
  layout: false,
})

const message = useMessage()
const loading = ref(false)
const formRef = ref()

// 表单数据
const formData = ref<UpdateSiteConfigDto>({
  name: '',
  description: '',
  keywords: '',
  author: '',
  authorLink: '',
  url: '',
  logo: '',
  icon: '',
  icp: '',
  defaultLocale: 'zh-CN',
  env: 'production',
})

// 表单验证规则
const rules = {
  name: {
    required: true,
    message: '请输入网站名称',
    trigger: ['blur', 'input'],
  },
  description: {
    required: true,
    message: '请输入网站描述',
    trigger: ['blur', 'input'],
  },
  keywords: {
    required: true,
    message: '请输入关键词',
    trigger: ['blur', 'input'],
  },
  author: {
    required: true,
    message: '请输入作者名称',
    trigger: ['blur', 'input'],
  },
  url: {
    required: true,
    message: '请输入网站URL',
    trigger: ['blur', 'input'],
  },
}

// 加载站点配置
async function loadSiteConfig() {
  try {
    loading.value = true
    const response = await $fetch<{ success: boolean, data: SiteConfig }>('/api/site-config')
    if (response.success && response.data) {
      const config = response.data
      formData.value = {
        name: config.name,
        description: config.description,
        keywords: config.keywords,
        author: config.author,
        authorLink: config.authorLink,
        url: config.url,
        logo: config.logo,
        icon: config.icon,
        icp: config.icp,
        defaultLocale: config.defaultLocale,
        env: config.env,
      }
    }
  }
  catch (error) {
    console.error('Failed to load site config:', error)
    message.error('加载站点配置失败')
  }
  finally {
    loading.value = false
  }
}

// 保存配置
async function saveSiteConfig() {
  try {
    await formRef.value?.validate()
    loading.value = true

    const response = await $fetch<{ success: boolean, data: SiteConfig }>('/api/site-config', {
      method: 'PUT',
      body: formData.value,
    })

    if (response.success) {
      message.success('站点配置保存成功')
    }
    else {
      message.error('保存失败')
    }
  }
  catch (error) {
    console.error('Failed to save site config:', error)
    message.error('保存站点配置失败')
  }
  finally {
    loading.value = false
  }
}

// 页面加载时获取配置
onMounted(() => {
  loadSiteConfig()
})
</script>

<template>
  <NuxtLayout name="admin">
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">
          站点配置管理
        </h1>
        <n-button
          type="primary"
          :loading="loading"
          @click="saveSiteConfig"
        >
          保存配置
        </n-button>
      </div>

      <n-card>
        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-placement="left"
          label-width="120px"
          require-mark-placement="left"
        >
          <n-grid cols="1 s:2" responsive="screen" :x-gap="24">
            <n-form-item-gi label="网站名称" path="name">
              <n-input
                v-model:value="formData.name"
                placeholder="请输入网站名称"
                :disabled="loading"
              />
            </n-form-item-gi>

            <n-form-item-gi label="作者" path="author">
              <n-input
                v-model:value="formData.author"
                placeholder="请输入作者名称"
                :disabled="loading"
              />
            </n-form-item-gi>

            <n-form-item-gi label="网站URL" path="url" span="2">
              <n-input
                v-model:value="formData.url"
                placeholder="请输入网站URL"
                :disabled="loading"
              />
            </n-form-item-gi>

            <n-form-item-gi label="作者链接" path="authorLink" span="2">
              <n-input
                v-model:value="formData.authorLink"
                placeholder="请输入作者链接"
                :disabled="loading"
              />
            </n-form-item-gi>

            <n-form-item-gi label="Logo URL" path="logo">
              <n-input
                v-model:value="formData.logo"
                placeholder="请输入Logo URL"
                :disabled="loading"
              />
            </n-form-item-gi>

            <n-form-item-gi label="图标URL" path="icon">
              <n-input
                v-model:value="formData.icon"
                placeholder="请输入图标URL"
                :disabled="loading"
              />
            </n-form-item-gi>

            <n-form-item-gi label="默认语言" path="defaultLocale">
              <n-select
                v-model:value="formData.defaultLocale"
                :options="[
                  { label: '简体中文', value: 'zh-CN' },
                  { label: 'English', value: 'en-US' },
                ]"
                :disabled="loading"
              />
            </n-form-item-gi>

            <n-form-item-gi label="环境" path="env">
              <n-select
                v-model:value="formData.env"
                :options="[
                  { label: '生产环境', value: 'production' },
                  { label: '开发环境', value: 'development' },
                ]"
                :disabled="loading"
              />
            </n-form-item-gi>

            <n-form-item-gi label="ICP备案" path="icp" span="2">
              <n-input
                v-model:value="formData.icp"
                placeholder="请输入ICP备案信息（可选）"
                :disabled="loading"
              />
            </n-form-item-gi>

            <n-form-item-gi label="网站描述" path="description" span="2">
              <n-input
                v-model:value="formData.description"
                type="textarea"
                placeholder="请输入网站描述"
                :rows="4"
                :disabled="loading"
              />
            </n-form-item-gi>

            <n-form-item-gi label="关键词" path="keywords" span="2">
              <n-input
                v-model:value="formData.keywords"
                type="textarea"
                placeholder="请输入关键词，用逗号分隔"
                :rows="3"
                :disabled="loading"
              />
            </n-form-item-gi>
          </n-grid>
        </n-form>
      </n-card>
    </div>
  </NuxtLayout>
</template>
