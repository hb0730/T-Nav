import { LogoReact } from '@vicons/ionicons5'
import type { MenuItem } from '..'
import ReactLogo from '@/assets/images/react-logo.png'
import ReactRouterLogo from '@/assets/images/react-router-logo.png'
import NextLogo from '@/assets/images/nextjs-logo.png'
import ReduxLogo from '@/assets/images/redux-logo.png'

export default {
  title: 'React',
  icon: LogoReact,
  children: [
    {
      title: 'React',
      url: 'https://beta.react.jscn.org/',
      logo: ReactLogo,
      description: 'React 用于构建 Web 和原生交互界面的库',
      tags: ['web', 'react', '前端'],
    },
    {
      title: 'Redux',
      url: 'https://cn.redux.js.org/',
      logo: ReduxLogo,
      description: 'Redux是JS 应用的状态容器，提供可预测的状态管理',
      tags: ['web', 'react', '前端'],
    },
    {
      title: 'Next.js',
      url: 'https://nextjs.org/',
      logo: NextLogo,
      description: 'Next.js 是一个轻量级的 React 服务端渲染应用框架',
      tags: ['web', 'react', '前端'],
    },
    {
      title: 'Ant Design',
      url: 'https://ant.design/index-cn',
      logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
      description: '一个企业级的 UI 设计语言和 React 组件库',
      tags: ['web', 'react', '前端', 'ui'],
    },
    {
      title: 'React Router',
      url: 'https://reactrouter.com',
      logo: ReactRouterLogo,
      description: 'React Router 是一个完整的路由解决方案',
      tags: ['web', 'react', '前端'],
    },
  ],
} as MenuItem
