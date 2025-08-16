import type { SiteConfig } from '~/types/database'

export function useDynamicSiteConfig() {
  const siteConfig = ref<SiteConfig | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSiteConfig() {
    if (siteConfig.value) {
      return siteConfig.value
    }

    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean, data: SiteConfig }>('/api/site-config')
      if (response.success && response.data) {
        siteConfig.value = response.data
      }
      else {
        error.value = '获取站点配置失败'
      }
    }
    catch (err) {
      console.error('Failed to fetch site config:', err)
      error.value = '网络错误'
    }
    finally {
      loading.value = false
    }

    return siteConfig.value
  }

  return {
    siteConfig: readonly(siteConfig),
    loading: readonly(loading),
    error: readonly(error),
    fetchSiteConfig,
  }
}

// 为了兼容性，同时导出useSiteConfig
export function useSiteConfig() {
  const { siteConfig, fetchSiteConfig } = useDynamicSiteConfig()

  // 确保在组件中获取配置
  onMounted(async () => {
    if (!siteConfig.value) {
      await fetchSiteConfig()
    }
  })

  // 返回reactive的siteConfig数据，如果还没加载则返回默认值
  return computed(() => siteConfig.value || {
    name: 'T-Nav',
    description: '一个现代化的导航网站',
    author: 'hb0730',
    authorLink: 'https://hb0730.me',
    url: 'https://t-nav.hb0730.me',
    logo: '/favicon.ico',
    icon: '/favicon.ico',
    keywords: '导航,网站,工具',
    icp: '',
  })
}
