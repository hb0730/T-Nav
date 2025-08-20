/**
 * 主题存储管理类
 * 统一管理 Cookie 存储，确保 SSR 兼容性
 */
export class ThemeStorage {
  private static readonly PREFERENCE_KEY = 'theme-preference'
  private static readonly ACTUAL_KEY = 'theme-actual'
  private static readonly EXPIRES_DAYS = 365

  /**
   * 获取主题偏好设置
   */
  static getPreference(): 'light' | 'dark' | 'system' {
    if (import.meta.server) {
      const headers = useRequestHeaders()
      const cookie = this.parseCookies(headers.cookie || '')
      return (cookie[this.PREFERENCE_KEY] as any) || 'system'
    }

    if (typeof document !== 'undefined') {
      const value = this.getCookie(this.PREFERENCE_KEY)
      return (value as any) || 'system'
    }

    return 'system'
  }

  /**
   * 设置主题偏好
   */
  static setPreference(value: 'light' | 'dark' | 'system'): void {
    if (import.meta.server)
      return

    this.setCookie(this.PREFERENCE_KEY, value)
  }

  /**
   * 获取实际主题
   */
  static getActual(): 'light' | 'dark' {
    if (import.meta.server) {
      const headers = useRequestHeaders()
      const cookie = this.parseCookies(headers.cookie || '')
      return (cookie[this.ACTUAL_KEY] as any) || 'light'
    }

    if (typeof document !== 'undefined') {
      const value = this.getCookie(this.ACTUAL_KEY)
      return (value as any) || 'light'
    }

    return 'light'
  }

  /**
   * 设置实际主题
   */
  static setActual(value: 'light' | 'dark'): void {
    if (import.meta.server)
      return

    this.setCookie(this.ACTUAL_KEY, value)
  }

  /**
   * 获取系统主题偏好
   */
  static getSystemPreference(): 'light' | 'dark' {
    if (import.meta.server) {
      const headers = useRequestHeaders()
      return headers['sec-ch-prefers-color-scheme'] === 'dark' ? 'dark' : 'light'
    }

    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    return 'light'
  }

  /**
   * 计算实际应该使用的主题
   */
  static computeActualTheme(preference?: 'light' | 'dark' | 'system'): 'light' | 'dark' {
    const themePreference = preference || this.getPreference()

    if (themePreference === 'system') {
      // 在服务端时，优先使用已存储的实际主题值，避免 hydration mismatch
      if (import.meta.server) {
        const stored = this.getActual()
        // 如果有存储的实际主题值，使用它；否则默认使用 light
        return stored || 'light'
      }
      // 客户端使用系统主题检测
      return this.getSystemPreference()
    }

    return themePreference as 'light' | 'dark'
  }

  /**
   * 监听系统主题变化
   */
  static watchSystemPreference(callback: (isDark: boolean) => void): (() => void) | null {
    if (import.meta.server || typeof window === 'undefined' || !window.matchMedia) {
      return null
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => callback(e.matches)

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }

    return null
  }

  /**
   * 监听 cookie 变化（跨标签页同步）
   * 使用 setInterval 轮询检测 cookie 变化
   */
  static watchCookieChange(callback: (key: string, value: string | null) => void): (() => void) | null {
    if (import.meta.server || typeof window === 'undefined') {
      return null
    }

    let lastPreference = this.getPreference()
    
    const intervalId = setInterval(() => {
      const currentPreference = this.getPreference()
      if (currentPreference !== lastPreference) {
        lastPreference = currentPreference
        callback(this.PREFERENCE_KEY, currentPreference)
      }
    }, 1000) // 每秒检查一次

    return () => clearInterval(intervalId)
  }

  // 私有方法

  private static getCookie(name: string): string | null {
    if (typeof document === 'undefined')
      return null

    try {
      const value = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${name}=`))
      return value ? decodeURIComponent(value.split('=')[1] || '') : null
    }
    catch {
      return null
    }
  }

  private static setCookie(name: string, value: string): void {
    if (typeof document === 'undefined')
      return

    const expires = new Date(Date.now() + this.EXPIRES_DAYS * 24 * 60 * 60 * 1000).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; samesite=lax; expires=${expires}`
  }

  private static parseCookies(cookieString: string): Record<string, string> {
    const cookies: Record<string, string> = {}

    try {
      cookieString.split(';').forEach((cookie) => {
        const [name, ...rest] = cookie.trim().split('=')
        if (name && rest.length > 0) {
          cookies[name] = decodeURIComponent(rest.join('='))
        }
      })
    }
    catch {
      // 忽略解析错误
    }

    return cookies
  }
}
