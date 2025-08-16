import { hashPassword } from '../lib/auth'
import { prisma } from '../server/prisma'

async function main() {
  console.log('🌱 开始数据库种子数据初始化...')

  // 创建默认管理员用户（如果不存在）
  const userCount = await prisma.user.count()
  if (userCount === 0) {
    const hashedPassword = await hashPassword('admin123')
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })
    console.log('✅ 创建默认管理员用户: admin/admin123')
  }

  // 创建示例分类
  const categoryCount = await prisma.category.count()
  if (categoryCount === 0) {
    const aiCategory = await prisma.category.create({
      data: {
        title: 'AI',
        icon: '/assets/imgs/ai/ai-logo.png',
        order: 0,
      },
    })

    const frontendCategory = await prisma.category.create({
      data: {
        title: '前端',
        icon: 'i-tabler-layout-grid-filled',
        order: 1,
      },
    })

    const vueCategory = await prisma.category.create({
      data: {
        title: 'Vue',
        icon: 'i-logos-vue',
        order: 2,
      },
    })

    console.log('✅ 创建示例分类')

    // 创建示例链接
    await prisma.link.createMany({
      data: [
        {
          title: 'DeepSeek',
          url: 'https://www.deepseek.com/',
          logo: 'https://www.deepseek.com/favicon.ico',
          description: '深度求索（DeepSeek），成立于2023年，专注于研究世界领先的通用人工智能底层模型与技术',
          tags: JSON.stringify(['chat', 'ai', '人工智能', 'deepseek']),
          categoryId: aiCategory.id,
          order: 0,
        },
        {
          title: 'Kimi',
          url: 'https://kimi.moonshot.cn',
          logo: 'https://statics.moonshot.cn/kimi-chat/favicon.ico',
          description: 'Kimi 是一个有着超大"内存"的智能助手',
          tags: JSON.stringify(['chat', 'ai', '人工智能', 'chatgpt']),
          categoryId: aiCategory.id,
          order: 1,
        },
        {
          title: 'Vue.js',
          url: 'https://vuejs.org',
          logo: 'https://vuejs.org/logo.svg',
          description: '渐进式 JavaScript 框架',
          tags: JSON.stringify(['vue', 'javascript', '前端框架']),
          categoryId: vueCategory.id,
          order: 0,
        },
      ],
    })

    console.log('✅ 创建示例链接')
  }

  // 创建示例友情链接
  const friendLinkCount = await prisma.friendLink.count()
  if (friendLinkCount === 0) {
    await prisma.friendLink.create({
      data: {
        title: 'hb0730',
        url: 'https://hb0730.me',
        logo: 'https://cravatar.cn/avatar/8b21c82521c08425c4426b156ff80623?size=256',
        description: 'hb0730的个人网站',
        order: 0,
      },
    })

    console.log('✅ 创建示例友情链接')
  }

  console.log('🎉 数据库种子数据初始化完成！')
}

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
