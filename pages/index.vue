<script setup lang="ts">
import WebsiteScrollBased from '~/components/Website/ScrollBased'
import { useGlobal } from '~/composables/useGlobal'
import { useDynamicSiteConfig } from '~/composables/useSiteConfig'

const { siteConfig, fetchSiteConfig } = useDynamicSiteConfig()
const { isSmallScreen } = useGlobal()

// 获取站点配置
await fetchSiteConfig()

// 获取首页数据（包含预加载的分类和导航菜单）
const { data: homepageData } = await useFetch('/api/homepage/categories?limit=6', {
  transform: (data: any) => data.data || { categories: [], navigationMenu: [], totalCategories: 0 },
  server: true,
})

// 从首页数据中提取导航菜单
const allMenuCategories = computed(() => homepageData.value?.navigationMenu || [])

// 提交表单状态
const showFriendLinkForm = ref(false)
const showLinkForm = ref(false)
</script>

<script lang="ts">
function handleSubmissionSuccess() {
  // 可以在这里添加成功后的处理逻辑，比如显示感谢信息
}
</script>

<template>
  <div>
    <div class="grid-wrapper">
      <div class="grid grid-cols-1 gap-[12px] lg:grid-cols-4">
        <div class="lg:col-span-1">
          <ColoredCard
            id="home"
            :title="siteConfig?.name || 'T-Nav 导航网站'"
            icon="i-tabler-heart"
          >
            <div class="space-y-3">
              <p class="text-sm text-gray-100 opacity-90">
                欢迎提交您的网站，我们会认真审核每一个申请。
              </p>

              <div
                class="flex gap-2"
                :class="isSmallScreen ? 'flex-col' : 'flex-col'"
              >
                <n-button
                  type="primary"
                  block
                  class="!bg-white !text-blue-600 !border-none hover:!bg-gray-100 font-medium"
                  :size="isSmallScreen ? 'large' : 'small'"
                  @click="showFriendLinkForm = true"
                >
                  <template #icon>
                    <i class="i-tabler-heart" />
                  </template>
                  友情链接申请
                </n-button>

                <n-button
                  type="primary"
                  ghost
                  block
                  class="!border-white !text-white hover:!bg-white hover:!text-blue-600 font-medium"
                  :size="isSmallScreen ? 'large' : 'small'"
                  @click="showLinkForm = true"
                >
                  <template #icon>
                    <i class="i-tabler-star" />
                  </template>
                  导航站收录申请
                </n-button>
              </div>

              <p class="text-xs text-gray-200 opacity-75 mt-3">
                已有网站？也可以前往
                <a
                  href="https://github.com/hb0730/T-Nav/issues"
                  rel="noopener"
                  target="_blank"
                  aria-label="GitHub"
                  class="text-white underline hover:text-gray-200 font-medium"
                >GitHub</a>
                提交 issue
              </p>
            </div>
          </ColoredCard>
        </div>
      </div>
      <div class="mt-[25px]">
        <WebsiteScrollBased
          :all-menu-categories="allMenuCategories"
          :preloaded-categories="homepageData?.categories || []"
          :estimated-category-height="350"
          :load-threshold="800"
        />
        <TheLink />
      </div>
    </div>

    <!-- 提交表单组件 -->
    <SubmissionForm
      v-model="showFriendLinkForm"
      type="friend-link"
      @success="handleSubmissionSuccess"
    />

    <SubmissionForm
      v-model="showLinkForm"
      type="link"
      @success="handleSubmissionSuccess"
    />
  </div>
</template>
