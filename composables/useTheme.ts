export function useTheme() {
  const nuxtApp = useNuxtApp()
  const fist = ref(true)
  const darkQuery = useMediaQuery('(prefers-color-scheme: dark)')
  const mode = useColorMode()
  const schema = useLocalStorage('vueuse-color-mode', mode.preference)
  const isDark = useState('isDark', () => {
    return schema.value === 'dark' || (schema.value === 'system' && mode.value === 'dark')
  })

  watch(darkQuery, (query) => {
    if (schema.value === 'system') {
      isDark.value = query
    }
  })

  const toggleTheme = () => {
    isDark.value = !isDark.value
    // ssr 时，localStorage 未初始化
    if (fist.value) {
      const _mode = localStorage.getItem('nuxt-color-mode')
      const _isDark = _mode === 'dark' || (_mode === 'system' && darkQuery.value)
      if (_isDark && isDark.value) {
        isDark.value = false
      }
      fist.value = false
    }
    mode.preference = isDark.value ? darkQuery.value ? 'system' : 'dark' : darkQuery.value ? 'light' : 'system'
  }
  // https://github.com/tusen-ai/naive-ui/issues/3765
  nuxtApp.hook('page:finish', () => {
    isDark.value = schema.value === 'dark' || (schema.value === 'system' && mode.value === 'dark')
  })

  return {
    isDark,
    toggleTheme,
  }
}
