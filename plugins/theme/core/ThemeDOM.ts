/**
 * 主题 DOM 操作类
 * 负责高效的主题相关 DOM 更新
 */
export class ThemeDOM {
  private static updateQueue: Array<() => void> = []
  private static isUpdating = false

  /**
   * 批量更新主题相关的 DOM 属性
   */
  static updateTheme(isDark: boolean): void {
    if (import.meta.server) return

    this.queueUpdate(() => {
      const html = document.documentElement

      // 使用 classList.toggle 进行原子性更新
      html.classList.toggle('dark', isDark)
      html.classList.toggle('light', !isDark)
      html.setAttribute('data-theme', isDark ? 'dark' : 'light')

      // 更新 CSS 自定义属性（如果需要）
      html.style.setProperty('--theme-mode', isDark ? 'dark' : 'light')
    })
  }

  /**
   * 设置主题加载状态
   */
  static setThemeLoaded(loaded: boolean): void {
    if (import.meta.server) return

    this.queueUpdate(() => {
      // 同时设置到 body 和 html 元素，确保样式生效
      document.body.classList.toggle('theme-loaded', loaded)
      document.documentElement.classList.toggle('theme-loaded', loaded)
    })
  }

  /**
   * 获取主题初始化脚本
   */
  static getInitScript(): string {
    return `
;(function() {
  function getCookieValue(name) {
    try {
      const value = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
      return value ? decodeURIComponent(value.split('=')[1]) : null
    } catch {
      return null
    }
  }
  
  function getSystemPreference() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  }
  
  function syncThemeToDOM() {
    try {
      const themePreference = getCookieValue('theme-preference') || 'system'
      let themeActual = getCookieValue('theme-actual')
      
      // 如果偏好是 system 且没有存储的实际主题，检测系统偏好
      if (themePreference === 'system' && !themeActual) {
        themeActual = getSystemPreference()
      }
      
      // 默认为 light
      themeActual = themeActual || 'light'
      
      const html = document.documentElement
      const isDark = themeActual === 'dark'
      
      // 同步 DOM 状态
      html.classList.toggle('dark', isDark)
      html.classList.toggle('light', !isDark)
      html.setAttribute('data-theme', themeActual)
      html.style.setProperty('--theme-mode', themeActual)
      
      // 延迟设置已加载状态，确保样式应用完成
      requestAnimationFrame(function() {
        html.classList.add('theme-loaded')
      })
    } catch (error) {
      console.warn('Theme sync failed:', error)
    }
  }
  
  // 立即同步主题
  syncThemeToDOM()
  
  // 监听主题变化
  if (window.addEventListener) {
    window.addEventListener('storage', function(e) {
      if (e.key === 'theme-preference' || e.key === null) {
        requestAnimationFrame(syncThemeToDOM)
      }
    })
  }
})()`.trim()
  }

  /**
   * 预加载主题样式
   */
  static preloadThemeStyles(): void {
    if (import.meta.server) return

    this.queueUpdate(() => {
      const html = document.documentElement
      
      // 预设主题变量，减少样式重计算
      html.style.setProperty('--theme-transition', 'background-color 0.15s ease-out, color 0.15s ease-out, border-color 0.15s ease-out')
      
      // 添加样式表，优化主题切换动画
      const style = document.createElement('style')
      style.id = 'theme-plugin-styles'
      style.textContent = `
        /* 优化的主题过渡效果 */
        .n-layout,
        .n-layout-header,
        .n-layout-sider,
        .n-layout-content,
        .n-card,
        .n-button,
        .n-menu,
        .n-dropdown,
        [class*='nav-'],
        [class*='theme-'] {
          transition: var(--theme-transition);
        }
        
        /* 防止主题闪烁 - 使用 html 类而不是 body 类 */
        html:not(.theme-loaded) .n-config-provider {
          opacity: 0.95;
        }
        
        html.theme-loaded .n-config-provider {
          opacity: 1;
          transition: opacity 0.1s ease-in-out;
        }
      `
      
      // 检查是否已经添加过样式
      if (!document.getElementById('theme-plugin-styles')) {
        document.head.appendChild(style)
      }
    })
  }

  // 私有方法

  /**
   * 将 DOM 更新加入队列，使用 requestAnimationFrame 批量执行
   */
  private static queueUpdate(updateFn: () => void): void {
    this.updateQueue.push(updateFn)
    
    if (!this.isUpdating) {
      this.isUpdating = true
      requestAnimationFrame(() => this.flushUpdates())
    }
  }

  /**
   * 批量执行 DOM 更新
   */
  private static flushUpdates(): void {
    const updates = this.updateQueue.splice(0)
    
    // 批量执行所有更新
    updates.forEach(updateFn => {
      try {
        updateFn()
      } catch (error) {
        console.warn('Theme DOM update failed:', error)
      }
    })
    
    // 强制一次重排，完成所有更新
    if (updates.length > 0) {
      void document.documentElement.offsetHeight
    }
    
    this.isUpdating = false
  }
}