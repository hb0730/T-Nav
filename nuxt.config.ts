// https://nuxt.com/docs/api/configuration/nuxt-config
import removeConsole from 'vite-plugin-remove-console'
import { darkThemeOverrides, lightThemeOverrides } from './themes'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: true,
  nitro: {
    prerender: {
      routes: ['/'],
      ignore: ['/sitemap.xml', '/robots.txt'],
    },
  },
  modules: [
    '@unocss/nuxt',
    '@vueuse/nuxt',
    '@bg-dev/nuxt-naiveui',
  ],
  app: {
    pageTransition: false, // 禁用页面过渡以避免Vue警告
    head: {
      script: [{ src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4970120746558354', crossorigin: 'anonymous' }],
    },
  },

  unocss: {
    autoImport: false,
  },
  css: [
    '@unocss/reset/tailwind.css',
  ],
  naiveui: {
    themeConfig: {
      dark: darkThemeOverrides,
      light: lightThemeOverrides,
    },
  },
  vueuse: {
    ssrHandlers: true,
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "sass:math";',
        },
      },
    },
    plugins: [
      removeConsole(),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // 将图标库分离到单独的块
            'iconify': ['@iconify-json/tabler', '@iconify-json/logos'],
            // 将 bcryptjs 和 jsonwebtoken 分离到单独的块
            'crypto': ['bcryptjs', 'jsonwebtoken'],
          },
        },
      },
      chunkSizeWarningLimit: 1000, // 增加警告阈值到1000kb
    },
  },
})
