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
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides" inline-theme-disabled>
    <n-global-style />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </n-config-provider>
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
.load-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  margin: 0;
  background: #000;
  animation: fadeIn 0.5s ease-in-out forwards;
  -webkit-animation: fadeIn 0.5s ease-in-out forwards;
}
.loader {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 6rem;
  margin-top: 3rem;
  margin-bottom: 3rem;
}
.loader:before,
.loader:after {
  content: '';
  position: absolute;
  border-radius: 50%;
  animation: pulsOut 1.8s ease-in-out infinite;
  filter: drop-shadow(0 0 1rem rgba(255, 255, 255, 0.75));
}
.loader:before {
  width: 100%;
  padding-bottom: 100%;
  box-shadow: inset 0 0 0 1rem #fff;
  animation-name: pulsIn;
}
.loader:after {
  width: calc(100% - 2rem);
  padding-bottom: calc(100% - 2rem);
  box-shadow: 0 0 0 0 #fff;
}

@keyframes pulsIn {
  0% {
    box-shadow: inset 0 0 0 1rem #fff;
    opacity: 1;
  }
  50%,
  100% {
    box-shadow: inset 0 0 0 0 #fff;
    opacity: 0;
  }
}

@keyframes pulsOut {
  0%,
  50% {
    box-shadow: 0 0 0 0 #fff;
    opacity: 0;
  }
  100% {
    box-shadow: 0 0 0 1rem #fff;
    opacity: 1;
  }
}
</style>
