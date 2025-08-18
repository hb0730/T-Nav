import { useColorMode, usePreferredDark } from '@vueuse/core'
import { darkTheme } from 'naive-ui'
import { darkThemeOverrides, lightThemeOverrides } from '~/themes'

function getServerTheme() {
  if (!import.meta.server) return null
  
  const headers = useRequestHeaders()
  const cookieTheme = useCookie('theme-mode', { default: () => 'auto' })
  
  // 优先使用 cookie 中的主题设置
  if (cookieTheme.value && ['light', 'dark', 'auto'].includes(cookieTheme.value)) {
    if (cookieTheme.value === 'auto') {
      // 使用浏览器偏好
      return headers['sec-ch-prefers-color-scheme'] === 'dark'
    }
    return cookieTheme.value === 'dark'
  }
  
  // 回退到浏览器偏好
  return headers['sec-ch-prefers-color-scheme'] === 'dark'
}

export function useTheme() {
  const loaded = useState('theme-loaded', () => false)
  
  // 服务端主题检测
  const serverTheme = getServerTheme()
  
  // 初始化主题状态，服务端使用检测到的主题，客户端使用 false 避免闪烁
  const isDark = useState('isDark', () => {
    return import.meta.server ? serverTheme ?? false : false
  })
  
  // 客户端才初始化 useColorMode
  const colorMode = import.meta.client 
    ? useColorMode({
        storageKey: 'vueuse-color-mode-preference',
        disableTransition: false,
      })
    : ref('auto')
  
  const preferredDark = import.meta.client ? usePreferredDark() : ref(false)

  // 同步主题设置到 cookie
  const themeCookie = useCookie('theme-mode', { 
    default: () => 'auto',
    sameSite: 'lax',
    secure: true,
    httpOnly: false
  })

  // 客户端主题同步函数
  const syncTheme = () => {
    if (import.meta.server) return
    
    const newIsDark = colorMode.value === 'dark' || 
      (colorMode.value === 'auto' && preferredDark.value)
    
    isDark.value = newIsDark
    themeCookie.value = colorMode.value
  }

  // 监听偏好变化（仅客户端）
  if (import.meta.client) {
    watch(preferredDark, () => {
      if (colorMode.value === 'auto') {
        syncTheme()
      }
    })
    
    watch(colorMode, () => {
      syncTheme()
    })
  }

  const toggleTheme = () => {
    if (import.meta.server) return
    
    // 循环切换：light -> dark -> auto
    if (colorMode.value === 'light') {
      colorMode.value = 'dark'
    } else if (colorMode.value === 'dark') {
      colorMode.value = 'auto'
    } else {
      colorMode.value = 'light'
    }
    
    syncTheme()
  }

  const theme = computed(() => {
    return isDark.value ? darkTheme : undefined
  })
  
  const themeOverrides = computed(() => {
    return isDark.value ? darkThemeOverrides : lightThemeOverrides
  })

  // 客户端水合时同步主题
  onMounted(() => {
    syncTheme()
    loaded.value = true
  })

  return {
    loaded,
    isDark: readonly(isDark),
    toggleTheme,
    theme,
    themeOverrides,
    colorMode: readonly(colorMode),
  }
}
