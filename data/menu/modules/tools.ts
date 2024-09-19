import type { MenuItem } from '..'
import FrpcDesktopLogo from '~/assets/imgs/tools/frpc-desktop-logo.png'

export default {
  title: '工具',
  icon: 'i-tabler-tool',
  children: [
    {
      title: 'Convertio',
      url: 'https://convertio.co/zh/',
      logo: 'https://convertio.co/favicon.ico',
      description: 'Convertio - 简单工具来转换所有种类的图像，视频，文档，音频和其他服务的格式。',
      tags: ['在线工具', '文件转换', '工具'],
    },
    {
      title: 'it-tools',
      url: 'https://it-tools.tech',
      logo: 'https://it-tools.tech/favicon.ico',
      description: 'it-tools 是为开发人员提供的便捷在线工具集合，具有出色的用户体验。',
      tags: ['在线工具', '编程', '开发'],
    },
    {
      title: '爱资料',
      url: 'https://www.toolnb.com/',
      logo: 'https://www.toolnb.com/favicon.ico',
      description: '在线工具,提供各种实用在线工具,包括单位换算,时间日期计算,密码生成器,编码解码,图片处理,音频处理,视频处理,文档处理,其他工具等。',
      tags: ['在线工具', '工具'],
    },
    {
      title: 'frpc-desktop',
      url: 'https://github.com/luckjiawei/frpc-desktop',
      logo: FrpcDesktopLogo,
      description: ' FRP跨平台桌面客户端，可视化配置，轻松实现内网穿透！支持所有frp版本 / 开机自启 / 可视化配置 / 免费开源',
      tags: ['工具', 'frp', '内网穿透'],
    },
  ],

} as MenuItem
