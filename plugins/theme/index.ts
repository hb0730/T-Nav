import { ThemeCore } from './core/ThemeCore'

export default defineNuxtPlugin({
  name: 'theme-plugin',
  setup() {
    // 初始化主题系统
    const themeCore = ThemeCore.getInstance()
    
    // 在服务端和客户端都可用的全局主题状态
    const themeState = themeCore.getReactiveState()
    
    // 提供全局访问
    return {
      provide: {
        themeCore,
        themeState,
      }
    }
  }
})