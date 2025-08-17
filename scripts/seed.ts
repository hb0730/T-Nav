import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始添加测试数据...')

  // 清空现有数据
  await prisma.linkSubmission.deleteMany()
  await prisma.friendLinkSubmission.deleteMany()
  await prisma.link.deleteMany()
  await prisma.friendLink.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  await prisma.siteConfig.deleteMany()

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@t-nav.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // 创建站点配置
  await prisma.siteConfig.create({
    data: {
      name: 'T-Nav 导航网站',
      description: '专门为开发者和技术爱好者设计的导航网站',
      keywords: 'T-Nav,导航网站,编程资源,开发者工具,Vue,React,AI工具',
      author: 'hb0730',
      authorLink: 'https://hb0730.me',
      url: 'https://t-nav.hb0730.me',
      logo: 'https://t-nav.hb0730.me/logo.png',
      icon: 'https://t-nav.hb0730.me/favicon.ico',
      icp: '',
      defaultLocale: 'zh-CN',
      env: 'development',
    },
  })

  // 创建分类
  const categories = [
    { title: 'AI工具', icon: 'i-tabler-robot', order: 0 },
    { title: '前端开发', icon: 'i-tabler-layout-grid-filled', order: 1 },
    { title: 'Vue生态', icon: 'i-logos-vue', order: 2 },
    { title: 'React生态', icon: 'i-logos-react', order: 3 },
    { title: '开发工具', icon: 'i-tabler-tool', order: 4 },
    { title: '设计资源', icon: 'i-tabler-palette', order: 5 },
    { title: '影视资源', icon: 'i-tabler-movie', order: 6 },
    { title: '技术博客', icon: 'i-tabler-news', order: 7 },
    { title: '图片资源', icon: 'i-tabler-photo', order: 8 },
  ]

  const createdCategories = await Promise.all(
    categories.map(category => prisma.category.create({ data: category })),
  )

  // 创建链接数据
  const links = [
    // AI工具
    {
      title: 'ChatGPT',
      url: 'https://chat.openai.com',
      logo: '/assets/imgs/ai/chatgpt-logo.png',
      description: 'OpenAI开发的AI对话助手，支持多种任务和对话',
      tags: JSON.stringify(['ai', '对话', 'openai', 'chatgpt']),
      categoryId: createdCategories[0].id,
      order: 0,
    },
    {
      title: 'Claude',
      url: 'https://claude.ai',
      logo: 'https://claude.ai/favicon.ico',
      description: 'Anthropic开发的AI助手，擅长分析和推理',
      tags: JSON.stringify(['ai', '对话', 'anthropic', 'claude']),
      categoryId: createdCategories[0].id,
      order: 1,
    },
    {
      title: 'Midjourney',
      url: 'https://www.midjourney.com',
      logo: '/assets/imgs/ai/midjourney-logo.png',
      description: '强大的AI绘画工具，生成高质量艺术图像',
      tags: JSON.stringify(['ai', '绘画', '图像生成', 'midjourney']),
      categoryId: createdCategories[0].id,
      order: 2,
    },
    {
      title: 'Cherry Studio',
      url: 'https://cherry-studio.ai',
      logo: '/assets/imgs/ai/cherry-studio-logo.png',
      description: '优雅的AI桌面客户端，支持多种AI模型',
      tags: JSON.stringify(['ai', '客户端', '桌面应用']),
      categoryId: createdCategories[0].id,
      order: 3,
    },

    // 前端开发
    {
      title: 'MDN Web文档',
      url: 'https://developer.mozilla.org',
      logo: 'https://developer.mozilla.org/favicon-48x48.png',
      description: 'Web开发者最权威的文档和学习资源',
      tags: JSON.stringify(['文档', 'javascript', 'html', 'css', 'web']),
      categoryId: createdCategories[1].id,
      order: 0,
    },
    {
      title: 'Can I Use',
      url: 'https://caniuse.com',
      logo: 'https://caniuse.com/img/favicon-128.png',
      description: '查询浏览器对Web技术的支持情况',
      tags: JSON.stringify(['兼容性', '浏览器', 'css', 'javascript']),
      categoryId: createdCategories[1].id,
      order: 1,
    },
    {
      title: 'Micro App',
      url: 'https://micro-zoe.github.io/micro-app/',
      logo: '/assets/imgs/frontend/micro-app-logo.png',
      description: '简约、高效、功能强大的微前端框架',
      tags: JSON.stringify(['微前端', '框架', 'javascript']),
      categoryId: createdCategories[1].id,
      order: 2,
    },

    // Vue生态
    {
      title: 'Vue.js',
      url: 'https://cn.vuejs.org',
      logo: 'https://cn.vuejs.org/logo.svg',
      description: '渐进式JavaScript框架',
      tags: JSON.stringify(['vue', '框架', 'javascript', '前端']),
      categoryId: createdCategories[2].id,
      order: 0,
    },
    {
      title: 'Nuxt.js',
      url: 'https://nuxt.com',
      logo: '/assets/imgs/vue/nuxt-logo.png',
      description: 'Vue.js全栈框架，支持SSR和静态生成',
      tags: JSON.stringify(['nuxt', 'vue', 'ssr', '全栈']),
      categoryId: createdCategories[2].id,
      order: 1,
    },
    {
      title: 'VueUse',
      url: 'https://vueuse.org',
      logo: '/assets/imgs/vue/vueuse-logo.png',
      description: 'Vue组合式API工具集合',
      tags: JSON.stringify(['vue', 'composables', 'utils', 'hooks']),
      categoryId: createdCategories[2].id,
      order: 2,
    },

    // React生态
    {
      title: 'React',
      url: 'https://react.dev',
      logo: '/assets/imgs/react/react-logo.png',
      description: '用于构建用户界面的JavaScript库',
      tags: JSON.stringify(['react', '框架', 'javascript', '前端']),
      categoryId: createdCategories[3].id,
      order: 0,
    },
    {
      title: 'Next.js',
      url: 'https://nextjs.org',
      logo: '/assets/imgs/react/nextjs-logo.png',
      description: 'React全栈框架，支持SSR和静态生成',
      tags: JSON.stringify(['nextjs', 'react', 'ssr', '全栈']),
      categoryId: createdCategories[3].id,
      order: 1,
    },
    {
      title: 'React Router',
      url: 'https://reactrouter.com',
      logo: '/assets/imgs/react/react-router-logo.png',
      description: 'React应用的声明式路由',
      tags: JSON.stringify(['react', 'router', '路由', 'spa']),
      categoryId: createdCategories[3].id,
      order: 2,
    },

    // 开发工具
    {
      title: 'GitHub',
      url: 'https://github.com',
      logo: '/assets/imgs/developed/github-logo.png',
      description: '全球最大的开源代码托管平台',
      tags: JSON.stringify(['git', '代码托管', '开源', '协作']),
      categoryId: createdCategories[4].id,
      order: 0,
    },
    {
      title: 'IconFont',
      url: 'https://www.iconfont.cn',
      logo: '/assets/imgs/developed/iconfont-logo.png',
      description: '阿里巴巴矢量图标库',
      tags: JSON.stringify(['图标', '矢量', '设计', 'svg']),
      categoryId: createdCategories[4].id,
      order: 1,
    },
    {
      title: 'FRPC Desktop',
      url: 'https://github.com/luckjiawei/frpc-desktop',
      logo: '/assets/imgs/tools/frpc-desktop-logo.png',
      description: 'FRP客户端桌面应用',
      tags: JSON.stringify(['frp', '内网穿透', '桌面应用', '网络工具']),
      categoryId: createdCategories[4].id,
      order: 2,
    },

    // 设计资源
    {
      title: 'Wallhaven',
      url: 'https://wallhaven.cc',
      logo: '/assets/imgs/images/wallhaven-logo.png',
      description: '高质量壁纸资源网站',
      tags: JSON.stringify(['壁纸', '设计', '图片', '高清']),
      categoryId: createdCategories[8].id,
      order: 0,
    },
  ]

  await Promise.all(
    links.map(link => prisma.link.create({ data: link })),
  )

  // 创建友链
  const friendLinks = [
    {
      title: 'hb0730\'s Blog',
      url: 'https://hb0730.me',
      logo: 'https://hb0730.me/favicon.ico',
      description: '个人技术博客，分享开发经验和技术心得',
      order: 0,
    },
    {
      title: 'Vue.js官网',
      url: 'https://cn.vuejs.org',
      logo: 'https://cn.vuejs.org/logo.svg',
      description: 'Vue.js官方中文网站',
      order: 1,
    },
    {
      title: 'Nuxt.js',
      url: 'https://nuxt.com',
      logo: 'https://nuxt.com/icon.png',
      description: 'Vue.js全栈框架',
      order: 2,
    },
  ]

  await Promise.all(
    friendLinks.map(friendLink => prisma.friendLink.create({ data: friendLink })),
  )

  // 创建友链申请记录
  const friendLinkSubmissions = [
    {
      title: '前端技术站',
      url: 'https://frontend-tech.com',
      logo: 'https://frontend-tech.com/favicon.ico',
      description: '专注前端技术分享的技术博客',
      contact: 'admin@frontend-tech.com',
      status: 'pending',
    },
    {
      title: 'DevTools集合',
      url: 'https://devtools-collection.com',
      logo: 'https://devtools-collection.com/favicon.ico',
      description: '开发者工具和资源集合网站',
      contact: 'contact@devtools-collection.com',
      status: 'approved',
    },
    {
      title: '设计师资源库',
      url: 'https://design-resources.com',
      logo: 'https://design-resources.com/favicon.ico',
      description: '设计师必备资源和工具',
      contact: 'hello@design-resources.com',
      status: 'rejected',
      reason: '网站内容与本站主题不符',
    },
  ]

  await Promise.all(
    friendLinkSubmissions.map(submission =>
      prisma.friendLinkSubmission.create({ data: submission }),
    ),
  )

  // 创建链接申请记录
  const linkSubmissions = [
    {
      title: 'Vite',
      url: 'https://vitejs.dev',
      logo: 'https://vitejs.dev/logo.svg',
      description: '下一代前端构建工具',
      categoryId: createdCategories[1].id,
      tags: JSON.stringify(['构建工具', 'vite', '前端', 'javascript']),
      contact: 'user@example.com',
      status: 'pending',
    },
    {
      title: 'TypeScript',
      url: 'https://www.typescriptlang.org',
      logo: 'https://www.typescriptlang.org/favicon-32x32.png',
      description: 'JavaScript的超集，添加了静态类型定义',
      categoryId: createdCategories[1].id,
      tags: JSON.stringify(['typescript', 'javascript', '类型检查']),
      contact: 'developer@example.com',
      status: 'approved',
    },
    {
      title: '某个过时工具',
      url: 'https://outdated-tool.com',
      logo: 'https://outdated-tool.com/favicon.ico',
      description: '已经过时的开发工具',
      categoryId: createdCategories[4].id,
      tags: JSON.stringify(['工具', '已过时']),
      contact: 'old@example.com',
      status: 'rejected',
      reason: '工具已过时，不推荐使用',
    },
  ]

  await Promise.all(
    linkSubmissions.map(submission =>
      prisma.linkSubmission.create({ data: submission }),
    ),
  )

  console.log('测试数据添加完成！')
  console.log('创建的数据统计：')
  console.log(`- 用户: 1个`)
  console.log(`- 分类: ${categories.length}个`)
  console.log(`- 链接: ${links.length}个`)
  console.log(`- 友链: ${friendLinks.length}个`)
  console.log(`- 友链申请: ${friendLinkSubmissions.length}个`)
  console.log(`- 链接申请: ${linkSubmissions.length}个`)
  console.log('默认管理员账号: admin / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
