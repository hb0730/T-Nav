import type { MenuItem } from '..'
import VoltaLogo from '~/assets/images/volta-logo.jpg'

export default {
  title: '前端',
  children: [
    {
      title: '现代 JavaScript 教程',
      logo: 'https://zh.javascript.info/img/sitetoolbar__logo_small_en.svg',
      url: 'https://zh.javascript.info',
      description: '以最新的 JavaScript 标准为基准。通过简单但足够详细的内容，为你讲解从基础到高阶的 JavaScript 相关知识。',
      tags: ['web', 'js', '前端'],
    },
    {
      title: 'ES6 入门教程',
      logo: 'https://wangdoc.com/es6/images/cover-3rd.jpg',
      url: 'https://es6.ruanyifeng.com',
      description: '《ECMAScript 6 入门教程》是一本开源的 JavaScript 语言教程，全面介绍 ECMAScript 6 新引入的语法特性。',
      tags: ['web', 'js', '前端', 'es6'],
    },
    {
      title: 'Vue3 Resource',
      url: 'https://github.com/hu-snail/vue3-resource',
      logo: 'https://vuejs.org/images/logo.png',
      description: '收集vue3资源，包含web端&移动端&小程序&Electron等栏目',
      tags: ['web', '移动端', '小程序', 'vue'],
    },
    {
      title: 'Volta',
      url: 'https://github.com/volta-cli/volta',
      logo: VoltaLogo,
      description: 'Volta 是一种管理 JavaScript 命令行工具的便捷方式。',
      tags: ['nodejs', 'cli', '工具', '版本管理'],
    },
    {
      title: 'pnpm',
      url: 'https://pnpm.io/',
      logo: 'https://pnpm.io/img/pnpm.svg',
      description: '快速的，节省磁盘空间的包管理工具',
      tags: ['nodejs', '包管理工具', '工具'],
    },
  ],
} as MenuItem
