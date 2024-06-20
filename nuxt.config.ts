import removeConsole from 'vite-plugin-remove-console'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.scss'],
  ssr: false,
  modules: [
    'nuxtjs-naive-ui',
    '@nuxtjs/tailwindcss',
    'nuxt-svgo',
  ],
  app: {
    pageTransition: { name: 'page', mode: 'in-out' },
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: './tailwind.config.js',
  },
  vite: {
    plugins: [
      removeConsole(),
      Components({
        resolvers: [NaiveUiResolver()],
      }),
    ],
  },
})
