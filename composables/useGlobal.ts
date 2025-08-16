// 检测移动端设备的函数（基于User-Agent）
function detectMobileDevice(): boolean {
  if (import.meta.server) {
    // 在服务端，尝试通过请求头检测
    try {
      const event = useRequestEvent()
      const userAgent = event?.node?.req?.headers?.['user-agent'] || ''
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    }
    catch {
      // 如果无法获取请求头，默认返回false（桌面端）
      return false
    }
  }

  if (import.meta.client) {
    // 在客户端，通过屏幕宽度检测
    return window.innerWidth < 768
  }

  return false
}

export function useGlobal() {
  // 检测是否为移动端
  const isMobile = useState('isMobile', () => detectMobileDevice())

  // 是否小屏幕（客户端动态检测）
  const isSmallScreen = useState('isSmallScreen', () => {
    if (import.meta.client) {
      return window.innerWidth < 768
    }
    // 服务端使用 isMobile 的值
    return isMobile.value
  })

  // 导航栏折叠状态 - 移动端默认折叠
  const navCollapse = useState('navCollapse', () => {
    // 服务端渲染时，如果是移动端则默认折叠菜单
    if (import.meta.server) {
      return isMobile.value
    }
    // 客户端使用屏幕宽度判断
    return isSmallScreen.value
  })

  // 切换导航栏折叠
  const toggleNavCollapse = () => {
    navCollapse.value = !navCollapse.value
  }

  // 监听屏幕宽度变化
  watch(isSmallScreen, (newValue) => {
    // 只在客户端且屏幕大小变化时自动调整
    if (import.meta.client) {
      navCollapse.value = newValue
    }
  })

  // 监听屏幕宽度（仅客户端）
  const onResize = () => {
    if (import.meta.client) {
      const newIsSmallScreen = window.innerWidth < 768
      isSmallScreen.value = newIsSmallScreen
      isMobile.value = newIsSmallScreen
    }
  }

  onMounted(() => {
    // 客户端挂载时立即检测屏幕尺寸
    onResize()
    window.addEventListener('resize', onResize)

    // 如果服务端和客户端的检测结果不一致，以客户端为准
    if (isSmallScreen.value !== isMobile.value) {
      isMobile.value = isSmallScreen.value
      navCollapse.value = isSmallScreen.value
    }
  })

  onUnmounted(() => {
    if (import.meta.client) {
      window.removeEventListener('resize', onResize)
    }
  })

  return {
    isMobile,
    isSmallScreen,
    navCollapse,
    toggleNavCollapse,
  }
}
