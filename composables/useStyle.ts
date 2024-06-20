import { darkTheme } from 'naive-ui'
import { darkThemeOverrides, lightThemeOverrides } from '~/themes'
import { useGlobal } from '~/composables/useGlobal'

export function useStyle() {
  const { isDark } = useGlobal()
  const themeOverrides = computed(() => isDark.value ? darkThemeOverrides : lightThemeOverrides)
  const theme = computed(() => isDark.value ? darkTheme : undefined)
  return { theme, themeOverrides }
}
