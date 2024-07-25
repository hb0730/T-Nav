import type { MenuItem } from '..'
import VoltaLogo from '~/assets/images/volta-logo.jpg'

export default {
  title: '前端',
  children: [
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
