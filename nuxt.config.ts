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
    componentIslands: true,
    asyncContext: true,
  },

  // 模块配置
  modules: [
    '@unocss/nuxt',
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

  // 自动导入配置
  imports: {
    dirs: ['composables/**'],
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
    minify: true,
    // 暂时禁用预渲染
    prerender: {
      routes: [],
    },
    // 静态资源优化
    experimental: {
      wasm: true,
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
    build: {
      // 代码分割优化
      rollupOptions: {
        output: {
          manualChunks: {
            // 将 NaiveUI 单独打包
            'naive-ui': ['naive-ui'],
            // 将 Vue 相关库单独打包
            'vue-vendor': ['vue', '@vue/shared'],
            // 将 VueUse 单独打包
            'vueuse': ['@vueuse/core'],
          },
        },
      },
      // 生产环境压缩
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log'],
        },
      },
      // chunk 大小警告阈值
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      include: ['naive-ui', '@vueuse/core'],
    },
  },

  // 构建优化
  build: {
    analyze: false,
    transpile: ['naive-ui'],
  },

  // 路由优化
  router: {
    options: {
      strict: true,
    },
  },

  // 功能配置
  features: {
    devLogs: false,
    inlineStyles: true,
  },
})
