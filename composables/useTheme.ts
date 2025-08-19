import { usePreferredDark } from '@vueuse/core'
import { darkTheme } from 'naive-ui'
import { darkThemeOverrides, lightThemeOverrides } from '~/themes'
import { perfMonitor } from '~/utils/performanceMonitor'

type ThemeMode = 'light' | 'dark' | 'system'

function getServerTheme() {
  if (!import.meta.server)
    return null

  const headers = useRequestHeaders()
  const themePreference = useCookie('theme-preference', { default: () => 'system' })
  const themeActual = useCookie('theme-actual', { default: () => 'light' })

  // 如果有实际主题 cookie，直接使用
  if (themeActual.value && ['light', 'dark'].includes(themeActual.value)) {
    return themeActual.value === 'dark'
  }

  // 回退到偏好设置计算
  if (themePreference.value && ['light', 'dark', 'system'].includes(themePreference.value)) {
    if (themePreference.value === 'system') {
      // 使用浏览器偏好
      return headers['sec-ch-prefers-color-scheme'] === 'dark'
    }
    return themePreference.value === 'dark'
  }

  // 最终回退到浏览器偏好
  return headers['sec-ch-prefers-color-scheme'] === 'dark'
}

// 批量 DOM 更新函数
function updateDOMBatch(isDarkTheme: boolean) {
  if (import.meta.server)
    return

  // 使用 requestAnimationFrame 确保在渲染帧中执行
  requestAnimationFrame(() => {
    const html = document.documentElement

    // 批量更新 DOM 属性
    html.classList.toggle('dark', isDarkTheme)
    html.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light')

    // 触发一次重排即可，避免多次操作
    void html.offsetHeight // 强制一次重排完成所有更新
  })
}

export function useTheme() {
  const loaded = useState('theme-loaded', () => false)

  // 服务端主题检测
  const serverTheme = getServerTheme()

  // 用户偏好设置（存储用户的主动选择）
  const themePreference = useCookie<ThemeMode>('theme-preference', {
    default: () => 'system',
    sameSite: 'lax',
    secure: false,
    httpOnly: false,
  })

  // 实际主题状态（存储当前生效的主题）
  const actualTheme = useCookie<'light' | 'dark'>('theme-actual', {
    default: () => 'light',
    sameSite: 'lax',
    secure: false,
    httpOnly: false,
  })

  // 初始化主题状态
  const isDark = useState('isDark', () => {
    if (import.meta.server) {
      return serverTheme ?? false
    }
    // 客户端初始化时使用实际主题
    return actualTheme.value === 'dark'
  })

  // 系统偏好检测
  const preferredDark = import.meta.client ? usePreferredDark() : ref(false)

  // 计算实际应该使用的主题
  const computeActualTheme = (): 'light' | 'dark' => {
    if (themePreference.value === 'system') {
      return preferredDark.value ? 'dark' : 'light'
    }
    return themePreference.value as 'light' | 'dark'
  }

  // 主题同步函数
  const syncTheme = () => {
    if (import.meta.server)
      return

    perfMonitor.measure('theme-sync', () => {
      const newActualTheme = computeActualTheme()
      const newIsDark = newActualTheme === 'dark'

      // 先更新状态
      actualTheme.value = newActualTheme
      isDark.value = newIsDark

      // 延迟 DOM 更新，避免阻塞状态更新
      updateDOMBatch(newIsDark)
    })
  }

  // 监听系统偏好变化（仅在 system 模式下生效）
  if (import.meta.client) {
    watch(preferredDark, () => {
      if (themePreference.value === 'system') {
        syncTheme()
      }
    })

    watch(themePreference, () => {
      syncTheme()
    })
  }

  const setTheme = (mode: ThemeMode) => {
    if (import.meta.server)
      return

    // 立即更新偏好设置
    themePreference.value = mode
    
    // 立即同步主题状态
    syncTheme()
    
    // 确保cookie立即更新
    if (import.meta.client) {
      // 使用更长的过期时间确保cookie持久化
      document.cookie = `theme-preference=${mode}; path=/; samesite=lax; expires=${new Date(Date.now() + 365*24*60*60*1000).toUTCString()}`
      
      // 触发storage事件，通知其他标签页
      try {
        localStorage.setItem('theme-preference', mode)
        localStorage.removeItem('theme-preference') // 立即删除，只为触发事件
      } catch (e) {
        // 忽略localStorage错误
      }
    }
  }

  const toggleTheme = () => {
    if (import.meta.server)
      return

    // 循环切换：light -> dark -> system
    if (themePreference.value === 'light') {
      setTheme('dark')
    }
    else if (themePreference.value === 'dark') {
      setTheme('system')
    }
    else {
      setTheme('light')
    }
  }

  const theme = computed(() => {
    return isDark.value ? darkTheme : undefined
  })

  const themeOverrides = computed(() => {
    return isDark.value ? darkThemeOverrides : lightThemeOverrides
  })

  // 获取当前主题的显示信息
  const themeInfo = computed(() => {
    const preference = themePreference.value
    const actual = actualTheme.value

    return {
      preference,
      actual,
      icon: preference === 'system'
        ? 'i-tabler-device-desktop'
        : actual === 'dark'
          ? 'i-tabler-moon'
          : 'i-tabler-sun',
      label: preference === 'system'
        ? `跟随系统 (${actual === 'dark' ? '深色' : '浅色'})`
        : actual === 'dark'
          ? '深色模式'
          : '浅色模式',
    }
  })

  // 客户端水合时同步主题
  onMounted(() => {
    syncTheme()
    loaded.value = true

    // 确保主题状态被正确设置，防止白屏
    nextTick(() => {
      if (!loaded.value) {
        loaded.value = true
      }
    })
  })

  // 监听路由变化时同步主题
  if (import.meta.client) {
    const route = useRoute()
    watch(() => route.fullPath, () => {
      // 路由切换时重新同步主题，确保DOM状态正确
      nextTick(() => {
        // 添加少量延迟确保页面DOM完全加载
        setTimeout(() => {
          syncTheme()
        }, 10)
      })
    }, { immediate: false })
    
    // 监听浏览器导航事件
    if (typeof window !== 'undefined') {
      const handleRouteChange = () => {
        setTimeout(() => {
          syncTheme()
        }, 5)
      }
      
      window.addEventListener('popstate', handleRouteChange)
      
      // 清理事件监听器
      onUnmounted(() => {
        window.removeEventListener('popstate', handleRouteChange)
      })
    }
  }

  return {
    loaded,
    isDark: readonly(isDark),
    themePreference: readonly(themePreference),
    actualTheme: readonly(actualTheme),
    themeInfo,
    setTheme,
    toggleTheme,
    theme,
    themeOverrides,
  }
}
