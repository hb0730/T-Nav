import { Images } from '@vicons/ionicons5'
import type { MenuItem } from '..'
import WallhavenLogo from '@/assets/images/wallhaven-logo.png'

export default {
  title: '图库',
  icon: Images,
  children: [
    {
      title: 'wallhaven',
      url: 'https://wallhaven.cc/',
      logo: WallhavenLogo,
      description: 'wallhaven.cc - 高清壁纸，每天更新，全免费',
      tags: ['wallhaven', '壁纸', '图片'],
    },
    {
      title: '彼岸图网',
      url: 'https://pic.netbian.com/',
      logo: '	https://pic.netbian.com/static/img/logo.jpg',
      description: '彼岸图网提供最新最全4K壁纸,4K高清壁纸,4K手机壁纸,4K,5K,6K,7K,8K壁纸,高清图片素材,包含4K游戏、动漫、美女、风景、影视、汽车、动物、人物、美食、背景、平板等精选高清4K壁纸大全',
      tags: ['彼岸图网', '壁纸', '图片'],
    },
  ],

} as MenuItem
