export function useGlobal() {
  const isClient = import.meta.client || false
  // 是否小屏幕
  const isSmallScreen = useState('isSmallScreen', () => {
    if (isClient) {
      return window.innerWidth < 768
    }
    return false
  })
  // 导航栏折叠状态 true:折叠 false:展开
  const navCollapse = useState('navCollapse', () => isSmallScreen.value)

  // 切换导航栏折叠
  const toggleNavCollapse = () => {
    navCollapse.value = !navCollapse.value
  }

  // 监听屏幕宽度变化
  watch(isSmallScreen, (v) => {
    navCollapse.value = v
  }, { immediate: true })
  // 监听屏幕宽度
  const onResize = () => {
    isSmallScreen.value = window.innerWidth < 768
  }

  onMounted(() => {
    onResize()
    window.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
  })

  return {
    isSmallScreen,
    navCollapse,
    toggleNavCollapse,
  }
}
