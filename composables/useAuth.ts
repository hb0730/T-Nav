import type { User } from '~/types/database'

export function useAuth() {
  const user = useState<Omit<User, 'password'> | null>('auth.user', () => null)
  const token = useState<string | null>('auth.token', () => null)

  const isLoggedIn = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  const login = async (authData: { user: Omit<User, 'password'>, token: string }) => {
    user.value = authData.user
    token.value = authData.token

    if (import.meta.client) {
      localStorage.setItem('auth_token', authData.token)
    }
  }

  const logout = async () => {
    user.value = null
    token.value = null

    if (import.meta.client) {
      localStorage.removeItem('auth_token')
      await navigateTo('/login')
    }
  }

  const loadUserFromToken = async () => {
    if (import.meta.server)
      return

    const savedToken = localStorage.getItem('auth_token')
    if (!savedToken)
      return

    try {
      const response = await $fetch<{ success: boolean, data: Omit<User, 'password'> }>('/api/auth/me', {
        headers: {
          authorization: `Bearer ${savedToken}`,
        },
      })

      if (response.success && response.data) {
        user.value = response.data
        token.value = savedToken
      }
      else {
        // Token无效，清除
        localStorage.removeItem('auth_token')
      }
    }
    catch {
      // Token无效，清除
      localStorage.removeItem('auth_token')
    }
  }

  const checkAuth = async () => {
    if (!isLoggedIn.value) {
      if (import.meta.client) {
        await navigateTo('/login')
      }
      return false
    }
    return true
  }

  return {
    user: readonly(user),
    token: readonly(token),
    isLoggedIn,
    isAdmin,
    login,
    logout,
    loadUserFromToken,
    checkAuth,
  }
}
