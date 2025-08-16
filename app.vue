<script lang="ts" setup>
import { useDynamicSiteConfig } from '~/composables/useSiteConfig'
import { useTheme } from '~/composables/useTheme'
import 'uno.css'
import '~/assets/css/main.scss'

const { theme, themeOverrides } = useTheme()
const { siteConfig, fetchSiteConfig } = useDynamicSiteConfig()

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
</style>

<style lang="scss" scoped>
</style>
