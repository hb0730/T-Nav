import { DeviceTv } from '@vicons/tabler'
import type { MenuItem } from '..'
import anfunsLogo from '@/assets/images/anfuns-logo.png'
import ncat1Logo from '@/assets/images/ncat1-logo.png'

export default {
  title: '在线影视',
  icon: DeviceTv,
  children: [
    {
      title: 'AnFuns动漫',
      url: 'https://www.anfuns.cc/',
      logo: anfunsLogo,
      description: 'AnFuns动漫,本站提供1080P 720P BDRIP动漫资源收集整理,专门为您提供海量的高质量高画质的在线动漫资源的网站门户.',
      tags: ['动漫', '在线观看'],
    },
    {
      title: '花子动漫',
      url: 'https://www.huazidm.com/',
      logo: 'https://www.huazidm.com/favicon.ico',
      description: '花子动漫专注于资源收集整理 海量的有效的高质量的动漫，资源下载，最新电影，观看完全免费、高速播放、更新及时在线，我们致力为所有动漫迷们提供最好看的动漫',
      tags: ['动漫', '在线观看'],
    },
    {
      title: '注视影视',
      url: 'https://gaze.run/',
      logo: 'https://gaze.run/favicon.ico',
      description: '流畅简洁高画质,热门剧、热门番剧、冷门电影免费在线观看',
      tags: ['电影', '电视剧', '综艺', '动漫', '在线观看'],
    },
    {
      title: '网飞猫',
      url: 'https://www.ncat1.app/',
      logo: ncat1Logo,
      description: '网飞猫-ncat1.app-看电影，可以改变人生！奈飞Netflix免费看，每天更新热火欧美日韩剧，最新韩国电影，在线免费电影网，VIP视频免费看！',
      tags: ['电影', '电视剧', '综艺', '动漫', '在线观看'],
    },
  ],

} as MenuItem
