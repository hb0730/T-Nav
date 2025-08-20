import type { GlobalThemeOverrides } from 'naive-ui'
import { darkTheme } from 'naive-ui'
import { darkThemeOverrides, lightThemeOverrides } from '~/themes'
import { perfMonitor } from '~/utils/performanceMonitor'
import { ThemeDOM } from './ThemeDOM'
import { ThemeStorage } from './ThemeStorage'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ActualTheme = 'light' | 'dark'

/**
 * 主题核心管理类
 * 提供统一的主题管理能力
 */
export class ThemeCore {
  private static instance: ThemeCore | null = null

  private themePreference = ref<ThemeMode>('system')
  private actualTheme = ref<ActualTheme>('light')
  private isDark = ref(false)
  private loaded = ref(false)

  private cleanupFunctions: Array<() => void> = []

  private constructor() {
    this.initialize()
  }

  /**
   * 获取单例实例
   */
  static getInstance(): ThemeCore {
    if (!this.instance) {
      this.instance = new ThemeCore()
    }
    return this.instance
  }

  /**
   * 初始化主题系统
   */
  private initialize(): void {
    // 在服务端和客户端都初始化主题状态
    this.syncThemeState()
    
    // 标记为已加载，确保SSR时也能正确获取theme值
    this.loaded.value = true

    // 只在客户端设置监听器和DOM操作
    if (import.meta.client) {
      this.setupWatchers()
      this.setupEventListeners()

      // 客户端启动时，同步DOM状态到Vue状态
      nextTick(() => {
        this.syncDOMStateToVue()
        ThemeDOM.preloadThemeStyles()
        ThemeDOM.setThemeLoaded(true)
      })
    }
  }

  /**
   * 同步DOM状态到Vue状态（修复初始化脚本导致的不一致）
   */
  private syncDOMStateToVue(): void {
    if (import.meta.server) return

    try {
      // 从cookie读取偏好
      const preference = ThemeStorage.getPreference()
      const actual = ThemeStorage.getActual()
      
      // 如果DOM和Vue状态不一致，以cookie为准更新Vue状态
      if (preference !== this.themePreference.value || actual !== this.actualTheme.value) {
        this.themePreference.value = preference
        this.actualTheme.value = actual
        this.isDark.value = actual === 'dark'
      }
      
      // 确保DOM与实际主题同步
      ThemeDOM.updateTheme(actual === 'dark')
    } catch (error) {
      console.error('Theme sync error:', error)
    }
  }

  /**
   * 同步主题状态
   */
  private syncThemeState(): void {
    const preference = ThemeStorage.getPreference()
    const actual = ThemeStorage.computeActualTheme(preference)
    const isDarkTheme = actual === 'dark'

    this.themePreference.value = preference
    this.actualTheme.value = actual
    this.isDark.value = isDarkTheme

    // 更新存储
    if (import.meta.client) {
      // 检查当前系统主题是否与存储的实际主题一致（仅当偏好为 'system' 时）
      if (preference === 'system') {
        const systemPreference = ThemeStorage.getSystemPreference()
        const storedActual = ThemeStorage.getActual()
        
        // 如果系统主题与存储的不一致，更新存储
        if (systemPreference !== storedActual) {
          this.actualTheme.value = systemPreference
          this.isDark.value = systemPreference === 'dark'
          ThemeStorage.setActual(systemPreference)
          ThemeDOM.updateTheme(systemPreference === 'dark')
        } else {
          ThemeDOM.updateTheme(isDarkTheme)
        }
      } else {
        ThemeStorage.setActual(actual)
        ThemeDOM.updateTheme(isDarkTheme)
      }
    }
  }

  /**
   * 设置主题偏好
   */
  setTheme(mode: ThemeMode): void {
    if (import.meta.server)
      return

    perfMonitor.measure('theme-change', () => {
      // 更新偏好设置
      this.themePreference.value = mode
      ThemeStorage.setPreference(mode)

      // 立即同步主题状态
      this.syncThemeState()
    })
  }

  /**
   * 切换主题（循环：light -> dark -> system）
   */
  toggleTheme(): void {
    if (import.meta.server)
      return

    const currentPreference = this.themePreference.value

    if (currentPreference === 'light') {
      this.setTheme('dark')
    }
    else if (currentPreference === 'dark') {
      this.setTheme('system')
    }
    else {
      this.setTheme('light')
    }
  }

  /**
   * 获取主题信息
   */
  getThemeInfo() {
    return computed(() => {
      const preference = this.themePreference.value
      const actual = this.actualTheme.value

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
  }

  /**
   * 获取 Naive UI 主题配置
   */
  getNaiveTheme() {
    return computed(() => {
      return this.isDark.value ? darkTheme : undefined
    })
  }

  /**
   * 获取 Naive UI 主题覆盖配置
   */
  getNaiveThemeOverrides(): ComputedRef<GlobalThemeOverrides> {
    return computed(() => {
      return this.isDark.value ? darkThemeOverrides : lightThemeOverrides
    })
  }

  /**
   * 获取响应式状态
   */
  getReactiveState() {
    return {
      loaded: readonly(this.loaded),
      isDark: readonly(this.isDark),
      themePreference: readonly(this.themePreference),
      actualTheme: readonly(this.actualTheme),
    }
  }

  /**
   * 设置监听器
   */
  private setupWatchers(): void {
    // 监听偏好设置变化
    watch(this.themePreference, () => {
      this.syncThemeState()
    })
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听系统主题变化
    const systemCleanup = ThemeStorage.watchSystemPreference(() => {
      if (this.themePreference.value === 'system') {
        this.syncThemeState()
      }
    })
    if (systemCleanup) {
      this.cleanupFunctions.push(systemCleanup)
    }

    // 监听跨标签页同步
    const cookieCleanup = ThemeStorage.watchCookieChange((key, value) => {
      if (key === 'theme-preference' && value) {
        this.themePreference.value = value as ThemeMode
      }
    })
    if (cookieCleanup) {
      this.cleanupFunctions.push(cookieCleanup)
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.cleanupFunctions.forEach(cleanup => cleanup())
    this.cleanupFunctions = []
    ThemeCore.instance = null
  }

  /**
   * 获取主题初始化脚本（用于防止闪烁）
   */
  static getInitScript(): string {
    return ThemeDOM.getInitScript()
  }
}
