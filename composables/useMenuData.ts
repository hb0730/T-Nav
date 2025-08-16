interface MenuItem {
  title: string
  icon?: string
  url?: string
  logo?: string
  description?: string
  deprecated?: boolean
  children?: MenuItem[]
  tags?: string[]
}

export function useMenuData() {
  const menuData = ref<MenuItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMenuData() {
    if (menuData.value.length > 0) {
      return menuData.value
    }

    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean, data: MenuItem[] }>('/api/menu')
      if (response.success) {
        menuData.value = response.data
      }
      else {
        error.value = '获取菜单数据失败'
      }
    }
    catch (err) {
      console.error('Failed to fetch menu data:', err)
      error.value = '网络错误'
    }
    finally {
      loading.value = false
    }

    return menuData.value
  }

  return {
    menuData: menuData as Readonly<Ref<MenuItem[]>>,
    loading: readonly(loading),
    error: readonly(error),
    fetchMenuData,
  }
}
