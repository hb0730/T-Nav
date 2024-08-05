import { LogoVue } from '@vicons/ionicons5'
import type { MenuItem } from '..'
import NuxtLogo from '@/assets/images/nuxt-logo.png'
import VueuseLogo from '@/assets/images/vueuse-logo.png'

export default {
  title: 'Vue',
  icon: LogoVue,
  children: [
    {
      title: 'Vue.js',
      url: 'https://cn.vuejs.org/',
      logo: 'https://vuejs.org/images/logo.png',
      description: 'Vue.js - 渐进式的 JavaScript 框架',
      tags: ['web', 'vue', '前端', 'vue'],
    },
    {
      title: 'Vue3 Resource',
      url: 'https://github.com/hu-snail/vue3-resource',
      logo: 'https://vuejs.org/images/logo.png',
      description: '收集vue3资源，包含web端&移动端&小程序&Electron等栏目',
      tags: ['web', '移动端', '小程序', 'vue'],
    },
    {
      title: 'Nuxt.js',
      url: 'https://zh.nuxtjs.org/',
      logo: NuxtLogo,
      description: 'Nuxt是一个免费且开源的框架，它提供了一种直观且可扩展的方式来创建类型安全、高性能和生产级别的全栈Web应用和网站，使用的是Vue.js。',
      tags: ['web', 'vue', '前端', 'ui', 'ssr'],
    },
    {
      title: 'Element Plus',
      url: 'https://element-plus.org/zh-CN/',
      logo: 'https://element-plus.org/images/element-plus-logo.svg',
      description: 'Element Plus基于 Vue 3，面向设计师和开发者的组件库',
      tags: ['web', 'vue', '前端', 'ui'],
    },
    {
      title: 'Naive UI',
      url: 'https://www.naiveui.com/zh-CN',
      logo: 'https://www.naiveui.com/assets/naivelogo-BdDVTUmz.svg',
      description: '一个 Vue 3 组件库,比较完整，主题可调，使用 TypeScript，快有点意思',
      tags: ['web', 'vue', '前端', 'ui'],
    },
    {
      title: 'VueUse',
      url: 'https://vueuse.org/',
      logo: VueuseLogo,
      description: 'VueUse 是基于 Composition API 的实用函数集合',
      tags: ['web', 'vue', '前端', '工具'],
    },
  ],
} as MenuItem
