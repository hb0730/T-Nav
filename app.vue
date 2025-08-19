<script lang="ts" setup>
import { useDynamicSiteConfig } from '~/composables/useSiteConfig'
import { useTheme } from '~/composables/useTheme'
import 'uno.css'
import '~/assets/css/main.scss'

const { theme, themeOverrides, loaded, isDark } = useTheme()
const { siteConfig, fetchSiteConfig } = useDynamicSiteConfig()

// 防止主题闪烁的内联脚本
const themeInitScript = `
;(function() {
  function getCookieValue(name) {
    try {
      const value = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
      return value ? decodeURIComponent(value.split('=')[1]) : null
    } catch {
      return null
    }
  }
  
  function syncThemeToDOM() {
    try {
      // 获取主题偏好，优先使用最新的cookie值
      const themePreference = getCookieValue('theme-preference') || 'system'
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      
      let actualTheme
      if (themePreference === 'system') {
        actualTheme = prefersDark ? 'dark' : 'light'
      } else {
        actualTheme = themePreference
      }
      
      const html = document.documentElement
      
      // 确保移除之前的状态
      html.classList.remove('dark', 'light')
      
      // 设置新的主题状态
      if (actualTheme === 'dark') {
        html.classList.add('dark')
        html.setAttribute('data-theme', 'dark')
      } else {
        html.classList.add('light')
        html.setAttribute('data-theme', 'light')
      }
      
      // 更新实际主题cookie
      document.cookie = 'theme-actual=' + actualTheme + '; path=/; samesite=lax; expires=' + new Date(Date.now() + 365*24*60*60*1000).toUTCString()
      
      // 添加调试信息（开发环境）
      if (typeof console !== 'undefined' && console.debug) {
        console.debug('Theme synced:', { preference: themePreference, actual: actualTheme, prefersDark })
      }
    } catch (error) {
      console.warn('Theme initialization failed:', error)
    }
  }
  
  // 立即同步主题
  syncThemeToDOM()
  
  // 监听cookie变化（通过storage事件检测）
  if (window.addEventListener) {
    window.addEventListener('storage', function(e) {
      if (e.key === 'theme-preference' || e.key === null) {
        setTimeout(syncThemeToDOM, 0)
      }
    })
    
    // 监听系统主题变化
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', function() {
          setTimeout(syncThemeToDOM, 0)
        })
      }
    }
  }
})()`

// 设置文档的主题类
useHead({
  htmlAttrs: {
    'data-theme': () => isDark.value ? 'dark' : 'light',
    'class': () => isDark.value ? 'dark' : 'light',
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
    :class="{ 'theme-loaded': loaded }"
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

/* 防止主题闪烁的过渡效果 */
.n-config-provider:not(.theme-loaded) {
  opacity: 0.95;
  transition: opacity 0.1s ease-in-out;
}

.n-config-provider.theme-loaded {
  opacity: 1;
}

/* 优化的主题过渡效果 - 只对关键元素应用 */
:root {
  --theme-transition: background-color 0.15s ease-out, color 0.15s ease-out, border-color 0.15s ease-out;
}

/* 只对需要主题过渡的元素应用动画 */
.n-layout,
.n-layout-header,
.n-layout-sider,
.n-layout-content,
.n-card,
.n-button,
.n-menu,
.n-dropdown,
[class*='nav-'],
[class*='theme-'] {
  transition: var(--theme-transition);
}
</style>

<style lang="scss" scoped>
</style>
