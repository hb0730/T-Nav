import { Api } from '@vicons/tabler'
import type { MenuItem } from '..'

export default {
  title: '免费API',
  icon: Api,
  children: [
    {
      title: 'UomgAPI',
      url: 'https://api.uomg.com/',
      description: 'UomgAPI 是 优启梦 支持并维护的 API 接口项目，致力于为用户提供稳定、快速的免费 API 接口服务平台。',
      tags: ['api', '接口', '免费'],
    },
    {
      title: '教书先生API',
      url: 'https://api.oioweb.cn/',
      logo: 'https://api.oioweb.cn/favicon.ico',
      description: '教书先生API 是 教书先生 支持并维护的 API 接口项目，致力于为用户提供稳定、快速的免费 API 接口服务平台。',
      tags: ['api', '接口', '免费'],
    },
    {
      title: '宋子宪API',
      url: 'https://api.songzixian.com/',
      description: 'API-领先的高性能免费API数据服务平台。我们专注于提供稳定、高速的数据接口服务，助您轻松实现各类应用。 本api服务系统是自研系统，采用java以及多种设计模式和多线程开发的高性能服务，长期稳定运行，免费使用!',
      tags: ['api', '接口', '免费', '数据', '服务'],
    },
    {
      title: '一言Hitokoto',
      url: 'https://hitokoto.cn/',
      logo: 'https://hitokoto.cn/favicon.ico',
      description: '一言（Hitokoto）网创立于 2016 年，隶属于萌创团队，目前网站主要提供一句话服务。不论在哪里，总有那么几个句子能穿透你的心。把这些句子汇聚起来，传递更多的感动。简单来说，一言指的就是一句话，可以是动漫中的台词，也可以是网络上的各种小段子。留下你所喜欢的那一句话，与大家分享，这就是一言存在的目的。',
      tags: ['api', '接口', '免费', '动漫', '网络', '台词'],
    },
  ],
} as MenuItem
