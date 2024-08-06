import type { MenuItem } from '..'
import NvmLogo from '~/assets/images/nvm-logo.png'
import VoltaLogo from '~/assets/images/volta-logo.jpg'
import MicroAppLogo from '~/assets/images/micro-app-logo.png'
import QiankunLogo from '~/assets/images/qiankun-logo.png'
import WujieLogo from '~/assets/images/wujie-logo.png'

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
      title: 'nvm',
      url: 'https://github.com/nvm-sh/nvm',
      logo: NvmLogo,
      description: 'Node Version Manager - 符合 POSIX 标准的 bash 脚本用于管理多个活动的 Node.js 版本',
      tags: ['nodejs', '版本管理', '工具'],
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
    {
      title: 'qiankun',
      url: 'https://qiankun.umijs.org/zh',
      logo: QiankunLogo,
      description: '乾坤是一个基于 single-spa 的微前端实现库，旨在帮助大家能更简单、无痛的构建一个生产可用微前端架构系统。',
      tags: ['微前端', '前端', 'react', 'vue'],
    },
    {
      title: 'micro-app',
      url: 'https://micro-zoe.github.io/micro-app/',
      logo: MicroAppLogo,
      description: 'MicroApp 一款简约、高效、功能强大的微前端框架',
      tags: ['微前端', '前端', 'react', 'vue'],
    },
    {
      title: 'wujie',
      url: 'https://wujie-micro.github.io/doc/',
      logo: WujieLogo,
      description: '无界 | 极致的微前端框架',
      tags: ['微前端', '前端', 'react', 'vue'],
    },
  ],
} as MenuItem
