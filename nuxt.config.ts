import removeConsole from 'vite-plugin-remove-console'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.scss'],
  ssr: true,
  modules: [
    'nuxtjs-naive-ui',
    '@nuxtjs/tailwindcss',
    'nuxt-svgo',
  ],
  app: {
    pageTransition: { name: 'page', mode: 'in-out' },
    head: {
      script: [{ src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4970120746558354', crossorigin: 'anonymous' }],
    },
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: './tailwind.config.js',
  },
  vite: {
    plugins: [
      removeConsole(),
      Components({
        dts: './types/components.d.ts',
        resolvers: [NaiveUiResolver()],
      }),
    ],
  },
})
