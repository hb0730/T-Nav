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

import { iconSafelist } from './lib/icons-safelist'

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
  safelist: iconSafelist,
})
