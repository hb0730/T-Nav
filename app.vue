<script lang="ts" setup>
import { darkTheme } from 'naive-ui'
import { useDynamicSiteConfig } from '~/composables/useSiteConfig'
import { ThemeCore } from '~/plugins/theme/core/ThemeCore'
import { darkThemeOverrides, lightThemeOverrides } from '~/themes'
import 'uno.css'
import '~/assets/css/main.scss'

const { siteConfig, fetchSiteConfig } = useDynamicSiteConfig()

// 直接使用 useCookie 确保 SSR 安全，避免 ThemeCore 单例污染
const themeActualCookie = useCookie('theme-actual', {
  default: () => 'light',
  sameSite: 'lax',
})

// 服务端安全的主题计算
const serverSafeIsDark = computed(() => {
  return themeActualCookie.value === 'dark'
})

// 使用 cookie 状态创建主题配置
const theme = computed(() => {
  return serverSafeIsDark.value ? darkTheme : undefined
})

const themeOverrides = computed(() => {
  return serverSafeIsDark.value ? darkThemeOverrides : lightThemeOverrides
})

// 主题状态同步由 ThemeCore 统一管理，移除重复逻辑

// 使用主题插件的初始化脚本
const themeInitScript = ThemeCore.getInitScript()

// 设置文档的主题类
useHead({
  htmlAttrs: {
    'data-theme': () => serverSafeIsDark.value ? 'dark' : 'light',
    'class': () => {
      const themeClass = serverSafeIsDark.value ? 'dark' : 'light'
      return `${themeClass} theme-loaded`
    },
  },
  script: [
    {
      innerHTML: themeInitScript,
      // 内联脚本，在 head 中立即执行
    },
  ],
})

// 在服务端和客户端都获取站点配置
await fetchSiteConfig()

// 动态设置SEO数据
watchEffect(() => {
  if (siteConfig.value) {
    const config = siteConfig.value

    useHead({
      title: config.name,
      link: [
        { rel: 'icon', type: 'image/x-icon', href: config.icon },
        { rel: 'apple-touch-icon', href: config.logo },
      ],
      meta: [
        { name: 'description', content: config.description },
        { name: 'keywords', content: config.keywords },
        { name: 'author', content: config.author },
        { name: 'copyright', content: `Copyright © 2024 - ${new Date().getFullYear()}` },
        { name: 'theme-color', content: '#1c758c' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      ],
    })

    useSeoMeta({
      title: config.name,
      description: config.description,
      ogTitle: config.name,
      ogDescription: config.description,
      ogImage: config.logo,
      ogUrl: config.url,
      twitterCard: 'summary_large_image',
      twitterTitle: config.name,
      twitterDescription: config.description,
      twitterImage: config.logo,
    })

    // 设置动态robots和sitemap
    useHead({
      link: [
        {
          rel: 'sitemap',
          type: 'application/xml',
          href: `${config.url}/sitemap.xml`,
        },
      ],
    })
  }
})

function _console() {
  if (!siteConfig.value)
    return

  // 控制台输出
  const styleTitle1 = 'font-size: 20px;font-weight: 600;color: rgb(244,167,89);'
  const styleTitle2 = 'font-size:12px;color: rgb(244,167,89);'
  const styleContent = 'color: rgb(30,152,255);'

  const title1 = `${siteConfig.value.name} 主页\n`
  const title2 = `${siteConfig.value.description}`
  const content = `\n\n 版本：v2.0.0 \n\n 主页：${siteConfig.value.authorLink} \n\n 作者：${siteConfig.value.author} \n\n`

  console.info(`%c${title1} %c${title2} %c${content}`, styleTitle1, styleTitle2, styleContent)
}

onMounted(() => {
  _console()
})
</script>

<template>
  <ClientOnly>
    <n-config-provider
      :theme="theme"
      :theme-overrides="themeOverrides"
      inline-theme-disabled
    >
      <n-message-provider>
        <n-dialog-provider>
          <NuxtLayout>
            <NuxtPage />
          </NuxtLayout>
        </n-dialog-provider>
      </n-message-provider>
      <n-global-style />
    </n-config-provider>
    <template #fallback>
      <!-- 服务端渲染的简化版本，使用默认light主题确保SEO -->
      <n-config-provider
        :theme="undefined"
        :theme-overrides="lightThemeOverrides"
        inline-theme-disabled
      >
        <n-message-provider>
          <n-dialog-provider>
            <div class="fallback-layout">
              <NuxtLayout>
                <NuxtPage />
              </NuxtLayout>
            </div>
          </n-dialog-provider>
        </n-message-provider>
      </n-config-provider>
    </template>
  </ClientOnly>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 主题样式由插件自动管理 */

/* fallback 样式，确保服务端渲染时有基本样式 */
.fallback-layout {
  min-height: 100vh;
  background-color: #f1f5f9;
  color: #374151;
}

.fallback-layout .dark {
  background-color: #111827;
  color: #f9fafb;
}
</style>

<style lang="scss" scoped>
</style>
