<script lang="ts" setup>
import { useTheme } from '~/composables/useTheme'
import 'uno.css'
import '~/assets/css/main.scss'

const { theme, themeOverrides } = useTheme()
const siteConfig = useSiteConfig()
function _console() {
  // 控制台输出
  const styleTitle1 = 'font-size: 20px;font-weight: 600;color: rgb(244,167,89);'
  const styleTitle2 = 'font-size:12px;color: rgb(244,167,89);'
  const styleContent = 'color: rgb(30,152,255);'

  const title1 = `${siteConfig.name} 主页\n`
  const title2 = `${siteConfig.description}`
  const content = `\n\n 版本：v1.0.1 \n\n 主页：${siteConfig.authorLink} \n\n 作者：${siteConfig.author} \n\n`

  console.info(`%c${title1} %c${title2} %c${content}`, styleTitle1, styleTitle2, styleContent)
}

useHead({
  title: siteConfig.name,
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
  ],
  meta: [
    { name: 'description', content: siteConfig.description },
    { name: 'keywords', content: siteConfig.keywords },
    { name: 'author', content: siteConfig.author },
    { name: 'copyright', content: `Copyright © 2024 - ${new Date().getFullYear()}` },
    { name: 'theme-color', content: 'white' },
  ],
})

useSeoMeta({
  title: siteConfig.name,
  description: siteConfig.description,
  ogTitle: siteConfig.title,
  ogDescription: siteConfig.description,
  ogImage: siteConfig.logo,
  ogUrl: siteConfig.url,
})
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
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <n-global-style />
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

<style lang="scss" scoped>
</style>
