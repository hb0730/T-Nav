import type { MenuItem } from '..'
import MidjourneyLogo from '~/assets/images/midjourney-logo.png'
import ChatGPTLogo from '~/assets/images/chatgpt-logo.png'
import AILogo from '~/assets/images/ai-logo.png'

export default {
  title: 'AI',
  icon: h('img', { src: AILogo }),
  children: [
    {
      title: 'Kimi',
      logo: 'https://statics.moonshot.cn/kimi-chat/favicon.ico',
      url: 'https://kimi.moonshot.cn',
      description: 'Kimi 是一个有着超大“内存”的智能助手，可以一口气读完二十万字的小说，还会上网冲浪，快来跟他聊聊吧 | Kimi.ai - Moonshot AI 出品的智能助手',
      tags: ['chat', 'ai', '人工智能', 'chatgpt'],
    },
    {
      title: 'Midjourney',
      logo: MidjourneyLogo,
      url: 'https://midjourney.com',
      description: 'Midjourney 是一个基于人工智能的创意设计平台，它可以帮助你快速生成创意设计稿，让你的设计工作更加高效 | Midjourney.com',
      tags: ['chat', 'ai', '人工智能', 'chatgpt'],
    },
    {
      title: 'ChatGPT',
      logo: ChatGPTLogo,
      url: 'https://chat.openai.com',
      description: 'ChatGPT 是一个基于 OpenAI API 的聊天机器人，它可以帮助你快速生成代码，让你的工作更加高效 | ChatGPT - OpenAI',
      tags: ['chat', 'ai', '人工智能', 'chatgpt'],
    },
  ],
} as MenuItem
