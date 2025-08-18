<script setup lang="ts">
interface Link {
  title: string
  url: string
  logo?: string
  description?: string
  tags: string[]
  deprecated: boolean
}

interface CategoryDetail {
  id: string
  title: string
  icon?: string
  description?: string
  totalLinks: number
  links: Link[]
}

const route = useRoute()
const { isSmallScreen } = useGlobal()

// 获取分类slug
const categorySlug = route.params.slug as string

// 先获取分类基本信息，判断是否需要分页
const { data: categoryData, error } = await useFetch<{
  success: boolean
  data: CategoryDetail
}>(`/api/categories/${encodeURIComponent(categorySlug)}/details`, {
  server: true,
})

// 如果分类不存在，显示404
if (error.value || !categoryData.value?.success) {
  throw createError({
    statusCode: 404,
    statusMessage: '分类不存在',
  })
}

const category = categoryData.value.data

// 判断是否需要分页（超过100个链接时使用分页）
const needsPagination = category.totalLinks > 100

// 设置页面元数据
useHead({
  title: `${category.title} - T-Nav 导航网站`,
  meta: [
    {
      name: 'description',
      content: `${category.title}相关的优质工具和资源推荐，共${category.totalLinks}个精选链接`,
    },
    {
      name: 'keywords',
      content: `${category.title},工具,资源,导航,${category.links.map(link => link.tags).flat().join(',')}`,
    },
  ],
})

// 分页状态（仅在需要分页时使用）
const currentPage = ref(1)
const pageSize = ref(50)

// 显示的链接
const displayLinks = computed(() => {
  if (!needsPagination) {
    // 数据量不大，直接显示所有链接
    return category.links.filter(link => !link.deprecated)
  }
  else {
    // 数据量大，需要分页，这里暂时显示空数组，实际数据通过客户端加载
    return []
  }
})

// 分页信息
const paginationInfo = ref({
  totalPages: needsPagination ? Math.ceil(category.totalLinks / pageSize.value) : 1,
  hasNextPage: false,
  hasPrevPage: false,
})

// 分页数据（用于大数据量时的客户端加载）
const paginatedLinks = ref<Link[]>([])

// 当需要分页时，在客户端加载第一页数据
if (needsPagination && process.client) {
  const loadPage = async (page: number) => {
    try {
      const { data } = await $fetch<{
        success: boolean
        data: {
          links: Link[]
          pagination: any
        }
      }>(`/api/categories/${encodeURIComponent(categorySlug)}/paginated?page=${page}&pageSize=${pageSize.value}`)

      if (data.success) {
        paginatedLinks.value = data.data.links
        paginationInfo.value = {
          totalPages: data.data.pagination.totalPages,
          hasNextPage: data.data.pagination.hasNextPage,
          hasPrevPage: data.data.pagination.hasPrevPage,
        }
      }
    }
    catch (error) {
      console.error('加载分页数据失败:', error)
    }
  }

  // 加载第一页
  loadPage(1)
}

// 最终显示的链接
const finalDisplayLinks = computed(() => {
  return needsPagination ? paginatedLinks.value : displayLinks.value
})

// 分页处理函数
async function loadPage(page: number, size: number = pageSize.value) {
  try {
    const { data } = await $fetch<{
      success: boolean
      data: {
        links: Link[]
        pagination: any
      }
    }>(`/api/categories/${encodeURIComponent(categorySlug)}/paginated?page=${page}&pageSize=${size}`)

    if (data.success) {
      paginatedLinks.value = data.data.links
      paginationInfo.value = {
        totalPages: data.data.pagination.totalPages,
        hasNextPage: data.data.pagination.hasNextPage,
        hasPrevPage: data.data.pagination.hasPrevPage,
      }

      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  catch (error) {
    console.error('加载分页数据失败:', error)
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadPage(page, pageSize.value)
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  loadPage(1, size)
}
</script>

<template>
  <div class="category-detail">
    <!-- 面包屑导航 -->
    <nav class="mb-6">
      <div class="flex items-center space-x-2 text-sm text-gray-600">
        <NuxtLink to="/" class="text-gray-900 hover:text-green-600">
          首页
        </NuxtLink>
        <span>/</span>
        <span class="text-gray-900 font-medium">{{ category.title }}</span>
      </div>
    </nav>

    <!-- 分类标题和描述 -->
    <div class="mb-8">
      <div class="flex items-center mb-4">
        <i
          v-if="category.icon"
          :class="category.icon"
          class="text-4xl mr-4 text-blue-600"
        />
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ category.title }}
          </h1>
          <p class="text-gray-600 mt-1">
            共收录 {{ category.totalLinks }} 个优质{{ category.title }}工具
          </p>
        </div>
      </div>

      <p v-if="category.description" class="text-gray-700 leading-relaxed">
        {{ category.description }}
      </p>
    </div>

    <!-- 加载状态（仅在分页模式下显示） -->
    <div v-if="needsPagination && finalDisplayLinks.length === 0" class="text-center py-12">
      <n-spin size="large" />
      <p class="text-gray-600 mt-4">
        正在加载工具列表...
      </p>
    </div>

    <!-- 工具列表 -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ToolCard
        v-for="link in finalDisplayLinks"
        :key="link.title"
        :model-value="link"
      />
    </div>

    <!-- 分页组件（仅在需要分页时显示） -->
    <div v-if="needsPagination && finalDisplayLinks.length > 0" class="mt-8 flex justify-center">
      <n-pagination
        v-model:page="currentPage"
        :page-count="paginationInfo.totalPages"
        :page-size="pageSize"
        show-size-picker
        show-quick-jumper
        :page-sizes="[20, 50, 100]"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      >
        <template #prefix>
          <span class="text-gray-600">
            共 {{ category.totalLinks }} 个工具
          </span>
        </template>
      </n-pagination>
    </div>

    <!-- 空状态提示 -->
    <div v-if="!needsPagination && finalDisplayLinks.length === 0" class="text-center py-12">
      <i class="i-tabler-folder-off text-6xl text-gray-300 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        暂无工具
      </h3>
      <p class="text-gray-600 mb-4">
        该分类下暂时没有可用的工具
      </p>
    </div>

    <!-- 返回顶部 -->
    <n-back-top />
  </div>
</template>

<style scoped>
.category-detail {
  min-height: calc(100vh - 200px);
}
</style>
