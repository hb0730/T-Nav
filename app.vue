<script setup lang="ts">
import { useStyle } from './composables/useStyle'

const appConfig = useAppConfig()
const { theme, themeOverrides } = useStyle()

function _console() {
  // 控制台输出
  const styleTitle1 = 'font-size: 20px;font-weight: 600;color: rgb(244,167,89);'
  const styleTitle2 = 'font-size:12px;color: rgb(244,167,89);'
  const styleContent = 'color: rgb(30,152,255);'

  const title1 = `${appConfig.siteTitle} 主页\n`
  const title2 = `${appConfig.siteDescription}`
  const content = `\n\n 版本：v1.0.0 \n\n 主页：${appConfig.siteAuthorLink} \n\n 作者：${appConfig.siteAuthor} \n\n`

  console.info(`%c${title1} %c${title2} %c${content}`, styleTitle1, styleTitle2, styleContent)
}

useHead({
  title: appConfig.siteTitle,
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    // { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    // { rel: 'manifest', href: '/manifest.json' },
    // { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#ffffff' },
    // { rel: 'shortcut icon', href: '/favicon.ico' },
  ],
  meta: [
    { name: 'description', content: appConfig.siteDescription },
    { name: 'keywords', content: appConfig.siteKeywords },
    { name: 'author', content: appConfig.siteAuthor },
    { name: 'copyright', content: `Copyright © 2024 - ${new Date().getFullYear()}` },
  ],
})

useSeoMeta({
  title: appConfig.siteTitle,
  description: appConfig.siteDescription,
  ogTitle: appConfig.siteTitle,
  ogDescription: appConfig.siteDescription,
  ogImage: appConfig.siteLogo,
  ogUrl: appConfig.siteUrl,
})

onMounted(() => {
  _console()
})
</script>

<template>
  <ClientOnly>
    <n-config-provider :theme="theme" :theme-overrides="themeOverrides" inline-theme-disabled>
      <n-global-style />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </n-config-provider>
  </ClientOnly>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.5s ease-in-out;
  overflow: hidden;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
