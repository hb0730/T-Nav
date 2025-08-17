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

export default defineConfig({
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
  ],
})
