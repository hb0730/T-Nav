import { useAuth } from './useAuth'

export function useAuthRedirect() {
  const { isLoggedIn, loadUserFromToken } = useAuth()

  /**
   * 智能登录重定向：根据登录状态决定跳转目标
   * 未登录 -> /login
   * 已登录 -> /admin
   */
  const smartLoginRedirect = async () => {
    // 首先尝试从本地存储加载用户信息
    await loadUserFromToken()

    if (isLoggedIn.value) {
      // 已登录，跳转到管理后台
      await navigateTo('/admin')
    }
    else {
      // 未登录，跳转到登录页面
      await navigateTo('/login')
    }
  }

  /**
   * 检查是否需要登录，如果需要则重定向到登录页面
   * @param redirectTo 登录成功后要重定向的页面，默认为当前页面
   */
  const requireAuth = async (redirectTo?: string) => {
    await loadUserFromToken()

    if (!isLoggedIn.value) {
      const currentPath = redirectTo || useRoute().fullPath
      const redirectUrl = currentPath !== '/login' && currentPath !== '/'
        ? `/login?redirect=${encodeURIComponent(currentPath)}`
        : '/login'

      await navigateTo(redirectUrl)
      return false
    }

    return true
  }

  /**
   * 如果已登录则重定向到管理后台
   * 用于登录页面，避免已登录用户重复登录
   */
  const redirectIfAuthenticated = async () => {
    await loadUserFromToken()

    if (isLoggedIn.value) {
      await navigateTo('/admin')
      return true
    }

    return false
  }

  return {
    smartLoginRedirect,
    requireAuth,
    redirectIfAuthenticated,
  }
}
