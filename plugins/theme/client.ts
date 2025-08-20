import { ThemeCore } from './core/ThemeCore'

/**
 * 主题插件客户端初始化脚本
 * 在客户端启动时自动初始化主题系统
 */
export default defineNuxtPlugin({
  name: 'theme-client',
  setup() {
    // 确保在客户端才执行
    if (import.meta.client) {
      // 获取主题核心实例并初始化
      const themeCore = ThemeCore.getInstance()
      
      // 监听路由变化，确保主题状态正确
      const router = useRouter()
      router.afterEach(() => {
        // 延迟同步，确保页面DOM完全加载
        nextTick(() => {
          setTimeout(() => {
            // 重新获取实例以确保状态同步
            const core = ThemeCore.getInstance()
            // 通过设置当前主题来触发同步
            const currentPreference = core.getReactiveState().themePreference.value
            core.setTheme(currentPreference)
          }, 10)
        })
      })

      // 页面卸载时清理资源
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
          themeCore.destroy()
        })
      }
    }
  }
})