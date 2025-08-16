export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuth()

  // 在客户端检查认证状态
  if (import.meta.client) {
    // 如果用户未登录，重定向到登录页
    if (!user.value) {
      return navigateTo('/login')
    }
  }

  // 在服务端也需要验证
  if (import.meta.server) {
    const token = useCookie('auth-token')
    if (!token.value) {
      return navigateTo('/login')
    }
  }
})
