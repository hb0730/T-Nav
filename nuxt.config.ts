// https://nuxt.com/docs/api/configuration/nuxt-config

import removeConsole from 'vite-plugin-remove-console'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.scss'],
  modules: ['nuxtjs-naive-ui', '@nuxtjs/tailwindcss', 'nuxt-svgo', 'nuxt-viewport'],
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
