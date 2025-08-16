import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWind3,
  transformerAttributifyJsx,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { iconSafelist } from './lib/icon-safelist'

export default defineConfig({
  // 配置内容扫描规则
  content: {
    filesystem: [
      'lib/icons-data.ts', // 扫描图标数据文件
    ],
  },
  theme: {
    colors: {
      primary: '#64cc96',
    },
  },
  presets: [
    presetWind3(),
    presetAttributify(),
    presetTypography(),
    presetIcons({
      scale: 1.2,
      // 确保包含所需的图标集
      collections: {
        tabler: () => import('@iconify-json/tabler/icons.json').then(i => i.default as any),
        logos: () => import('@iconify-json/logos/icons.json').then(i => i.default as any),
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
    transformerAttributifyJsx(),
  ],
  safelist: [
    // 保留原有的安全列表
    'i-logos-vue',
    'i-logos-react',
    'i-tabler-api',
    'i-tabler-brand-blogger',
    'i-tabler-brand-codesandbox',
    'i-tabler-brand-github-filled',
    'i-tabler-brand-github',
    'i-tabler-device-tv',
    'i-tabler-video',
    'i-tabler-tool',
    'i-tabler-photo',
    // 动态生成的图标安全列表
    ...iconSafelist,
  ],
})
