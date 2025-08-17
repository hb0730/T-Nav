import { darkTheme } from 'naive-ui'
import { useColorMode, usePreferredDark } from '@vueuse/core'
import { darkThemeOverrides, lightThemeOverrides } from '~/themes'

export function useTheme() {
  const loaded = useState('loaded', () => false)
  // TODO 由于 useColorMode 依赖于 window.localStorage，所以在服务端渲染时无法使用localStorage，导致渲染时无法获取到正确的主题
  const colorMode = useColorMode({
    storageKey: 'vueuse-color-mode-preference',
    disableTransition: false,
  })
  const preferredDark = usePreferredDark()
  const isDark = useState('isDark', () => {
    console.log('isDark', colorMode.value, preferredDark.value)
    if (import.meta.server) {
      const headers = useRequestHeaders()
      return headers['sec-ch-prefers-color-scheme'] === 'dark'
    }
    return colorMode.value === 'dark' || (colorMode.value === 'auto' && preferredDark.value)
  })

  watch(preferredDark, (value) => {
    isDark.value = value
  })

  const syncDark = () => {
    isDark.value = colorMode.value === 'dark' || (colorMode.value === 'auto' && preferredDark.value)
  }
  const toggleTheme = () => {
    console.log('toggleTheme', isDark.value, preferredDark.value)
    isDark.value = !isDark.value
    colorMode.value = isDark.value ? preferredDark.value ? 'auto' : 'dark' : preferredDark.value ? 'light' : 'auto'
  }
  const theme = computed(() => {
    return isDark.value ? darkTheme : undefined
  })
  const themeOverrides = computed(() => {
    return isDark.value ? darkThemeOverrides : lightThemeOverrides
  })

  onMounted(() => {
    // 修复服务端渲染时无法获取到正确的主题
    syncDark()
    loaded.value = true
  })

  return {
    loaded,
    isDark,
    toggleTheme,
    theme,
    themeOverrides,
  }
}
