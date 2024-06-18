import { BrandCodesandbox } from '@vicons/tabler'
import type { MenuItem } from '..'
import IconFontLogo from '~/assets/images/iconfont-logo.png'
import GithubLogo from '~/assets/images/github-logo.png'

export default {
  title: '编程开发',
  icon: BrandCodesandbox,
  children: [
    {
      title: 'Github',
      url: 'https://github.com',
      logo: GithubLogo,
      description: '全球最大的代码托管平台',
      tags: ['github', '编程', '开发'],
    },
    {
      title: 'Gitee',
      url: 'https://gitee.com',
      logo: 'https://gitee.com/favicon.ico',
      description: '国内最大的代码托管平台',
      tags: ['gitee', '编程', '开发'],
    },
    {
      title: 'Linux 命令搜索',
      url: 'https://wangchujiang.com/linux-command/',
      logo: 'https://wangchujiang.com/linux-command/img/favicon.ico',
      description: 'Linux命令大全搜索工具，内容包含Linux命令手册、详解、学习、搜集',
      tags: ['linux', '编程', '开发'],
    },
    {
      title: 'iconfont',
      url: 'https://www.iconfont.cn/',
      logo: IconFontLogo,
      description: 'iconfont-国内功能很强大且图标内容很丰富的矢量图标库，提供矢量图标下载、在线存储、格式转换等功能。阿里巴巴体验团队倾力打造，设计和前端开发的便捷工具',
      tags: ['iconfont', '编程', '开发', 'icon'],
    },
    {
      title: 'PageSpeed Insights',
      url: 'https://pagespeed.web.dev',
      logo: 'https://www.gstatic.com/pagespeed/insights/ui/logo/favicon_48.png',
      description: 'PageSpeed Insights 是一个开源的网站性能分析工具，可以帮助网站管理员检查网站的性能。',
      tags: ['分析', '性能', '编程', '开发'],
    },

  ],
} as MenuItem
