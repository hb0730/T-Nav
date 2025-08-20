<script lang="ts" setup>
import { useDynamicSiteConfig } from '~/composables/useSiteConfig'
import { ThemeCore } from '~/plugins/theme/core/ThemeCore'
import { darkTheme } from 'naive-ui'
import { darkThemeOverrides, lightThemeOverrides } from '~/themes'
import 'uno.css'
import '~/assets/css/main.scss'

const { siteConfig, fetchSiteConfig } = useDynamicSiteConfig()

// 直接使用 useCookie 确保服务端和客户端一致
const themePreferenceCookie = useCookie('theme-preference', { 
  default: () => 'system',
  sameSite: 'lax'
})
const themeActualCookie = useCookie('theme-actual', { 
  default: () => 'light',
  sameSite: 'lax'
})

// 服务端安全的主题计算
const serverSafeIsDark = computed(() => {
  // 直接使用 theme-actual cookie 的值
  return themeActualCookie.value === 'dark'
})

// 直接创建与 cookie 状态同步的 Naive UI 主题配置
const theme = computed(() => {
  return serverSafeIsDark.value ? darkTheme : undefined
})

const themeOverrides = computed(() => {
  return serverSafeIsDark.value ? darkThemeOverrides : lightThemeOverrides
})

// 监听客户端的主题变化，确保 cookie 状态同步
if (import.meta.client) {
  // 监听 storage 事件来同步跨标签页的主题变化
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme-preference' || e.key === null) {
      // 强制触发 cookie 重新读取
      nextTick(() => {
        const newPreference = document.cookie
          .split('; ')
          .find(row => row.startsWith('theme-preference='))
          ?.split('=')[1] || 'system'
        const newActual = document.cookie
          .split('; ')
          .find(row => row.startsWith('theme-actual='))
          ?.split('=')[1] || 'light'
        
        if (themePreferenceCookie.value !== newPreference) {
          themePreferenceCookie.value = newPreference as any
        }
        if (themeActualCookie.value !== newActual) {
          themeActualCookie.value = newActual as any
        }
      })
    }
  })
  
  // 也监听 cookie 变化（通过轮询检测）
  let lastActual = themeActualCookie.value
  setInterval(() => {
    const currentActual = document.cookie
      .split('; ')
      .find(row => row.startsWith('theme-actual='))
      ?.split('=')[1] || 'light'
    
    if (currentActual !== lastActual) {
      lastActual = currentActual
      themeActualCookie.value = currentActual as any
    }
  }, 100) // 每100ms检查一次
}

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
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 主题样式由插件自动管理 */
</style>

<style lang="scss" scoped>
</style>
