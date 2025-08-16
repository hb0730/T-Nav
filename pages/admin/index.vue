<script setup lang="ts">
import type { Category, Link } from '~/types/database'

definePageMeta({
  layout: false,
})

const router = useRouter()

const { data: categoriesRes } = await $fetch<{ success: boolean, data: Category[] }>('/api/categories')
const { data: linksRes } = await $fetch<{ success: boolean, data: Link[] }>('/api/links')

const categories = categoriesRes || []
const links = linksRes || []

const stats = computed(() => ({
  categoriesCount: categories.length,
  linksCount: links.length,
  activeLinksCount: links.filter(link => !link.deprecated).length,
  deprecatedLinksCount: links.filter(link => link.deprecated).length,
}))

const recentLinks = computed(() => {
  return links
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
})

function getCategoryName(categoryId: string) {
  const category = categories.find(cat => cat.id === categoryId)
  return category?.title || '未知分类'
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('zh-CN')
}

function goTo(path: string) {
  router.push(path)
}
</script>

<template>
  <NuxtLayout name="admin">
    <div class="space-y-6">
      <n-grid :cols="4" :x-gap="16" :y-gap="16">
        <n-grid-item>
          <n-card>
            <n-statistic label="总分类数" :value="stats.categoriesCount">
              <template #prefix>
                <i class="i-tabler-category text-blue-500" />
              </template>
            </n-statistic>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card>
            <n-statistic label="总链接数" :value="stats.linksCount">
              <template #prefix>
                <i class="i-tabler-link text-green-500" />
              </template>
            </n-statistic>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card>
            <n-statistic label="活跃链接" :value="stats.activeLinksCount">
              <template #prefix>
                <i class="i-tabler-check text-green-500" />
              </template>
            </n-statistic>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card>
            <n-statistic label="废弃链接" :value="stats.deprecatedLinksCount">
              <template #prefix>
                <i class="i-tabler-x text-red-500" />
              </template>
            </n-statistic>
          </n-card>
        </n-grid-item>
      </n-grid>

      <n-card title="快速操作">
        <div class="flex gap-4">
          <n-button type="primary" @click="goTo('/admin/categories')">
            <template #icon>
              <i class="i-tabler-plus" />
            </template>
            添加分类
          </n-button>
          <n-button type="primary" @click="goTo('/admin/links')">
            <template #icon>
              <i class="i-tabler-plus" />
            </template>
            添加链接
          </n-button>
        </div>
      </n-card>

      <n-card title="最近创建的链接">
        <n-list>
          <n-list-item v-for="link in recentLinks" :key="link.id">
            <n-thing :title="link.title" :description="link.description">
              <template #header-extra>
                <n-tag size="small">
                  {{ getCategoryName(link.categoryId) }}
                </n-tag>
              </template>
              <template #footer>
                <div class="text-sm text-gray-500">
                  创建时间: {{ formatDate(link.createdAt) }}
                </div>
              </template>
            </n-thing>
          </n-list-item>
        </n-list>
      </n-card>
    </div>
  </NuxtLayout>
</template>
