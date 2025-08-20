import type { ThemeMode } from '../core/ThemeCore'
import { ThemeCore } from '../core/ThemeCore'

/**
 * 简化的主题插件 Composable
 * 提供统一的主题管理接口
 */
export function useThemePlugin() {
  const themeCore = ThemeCore.getInstance()
  const reactiveState = themeCore.getReactiveState()

  return {
    // 响应式状态
    ...reactiveState,
    
    // 主题信息
    themeInfo: themeCore.getThemeInfo(),
    
    // Naive UI 配置
    theme: themeCore.getNaiveTheme(),
    themeOverrides: themeCore.getNaiveThemeOverrides(),
    
    // 主题操作方法
    setTheme: (mode: ThemeMode) => themeCore.setTheme(mode),
    toggleTheme: () => themeCore.toggleTheme(),
  }
}