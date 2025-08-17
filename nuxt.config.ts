// https://nuxt.com/docs/api/configuration/nuxt-config
import removeConsole from 'vite-plugin-remove-console'
import { darkThemeOverrides, lightThemeOverrides } from './themes'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: true,

  // 性能优化
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    viewTransition: true,
  },

  // 模块配置
  modules: [
    '@unocss/nuxt',
    '@vueuse/nuxt',
    '@bg-dev/nuxt-naiveui',
  ],

  // 应用配置
  app: {
    pageTransition: false, // 禁用页面过渡以避免Vue警告
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' },
      ],
      script: [{
        src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4970120746558354',
        crossorigin: 'anonymous',
        async: true,
      }],
    },
  },

  // CSS 配置
  css: [
    '@unocss/reset/tailwind.css',
  ],

  // UnoCSS 配置
  unocss: {
    autoImport: false,
  },

  // NaiveUI 配置
  naiveui: {
    themeConfig: {
      dark: darkThemeOverrides,
      light: lightThemeOverrides,
    },
  },

  // VueUse 配置
  vueuse: {
    ssrHandlers: true,
  },

  // 运行时配置
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'development-jwt-secret',
    public: {
      appName: 'T-Nav',
    },
  },

  // Nitro 配置
  nitro: {
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
  },

  // Vite 配置
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
  },

  // 构建优化
  build: {
    analyze: false,
  },
})
