<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useTheme } from '~/composables/useTheme'

const { theme, themeOverrides } = useTheme()
const { user, logout, loadUserFromToken, checkAuth } = useAuth()
const router = useRouter()
const route = useRoute()

const collapsed = ref(false)

const menuOptions = [
  {
    label: '仪表板',
    key: '/admin',
    icon: () => h('i', { class: 'i-tabler-dashboard' }),
  },
  {
    label: '分类管理',
    key: '/admin/categories',
    icon: () => h('i', { class: 'i-tabler-category' }),
  },
  {
    label: '链接管理',
    key: '/admin/links',
    icon: () => h('i', { class: 'i-tabler-link' }),
  },
  {
    label: '友情链接',
    key: '/admin/friends',
    icon: () => h('i', { class: 'i-tabler-heart' }),
  },
  {
    label: '申请审核',
    key: '/admin/submissions',
    icon: () => h('i', { class: 'i-tabler-clipboard-check' }),
  },
  {
    label: '站点配置',
    key: '/admin/site-config',
    icon: () => h('i', { class: 'i-tabler-settings' }),
  },
  {
    label: '备份管理',
    key: '/admin/backup',
    icon: () => h('i', { class: 'i-tabler-database-export' }),
  },
]

const pageTitle = computed(() => {
  const currentMenu = menuOptions.find(item => item.key === route.path)
  return currentMenu?.label || '管理端'
})

function handleMenuSelect(key: string) {
  router.push(key)
}

function goHome() {
  router.push('/')
}

async function handleLogout() {
  await logout()
}

// 页面加载时验证登录状态
onMounted(async () => {
  await loadUserFromToken()
  await checkAuth()
})
</script>

<template>
  <n-config-provider
    :theme="theme"
    :theme-overrides="themeOverrides"
    inline-theme-disabled
  >
    <n-message-provider>
      <n-dialog-provider>
        <n-layout has-sider class="h-100vh">
          <n-layout-sider
            bordered
            show-trigger
            collapse-mode="width"
            :collapsed-width="64"
            :width="240"
            :collapsed="collapsed"
            @collapse="collapsed = true"
            @expand="collapsed = false"
          >
            <div class="h-16 flex items-center justify-center border-b">
              <h1 v-if="!collapsed" class="text-lg font-bold">
                T-Nav 管理端
              </h1>
              <h1 v-else class="text-lg font-bold">
                T
              </h1>
            </div>
            <n-menu
              :collapsed="collapsed"
              :collapsed-width="64"
              :collapsed-icon-size="22"
              :options="menuOptions"
              :value="$route.path"
              @update:value="handleMenuSelect"
            />
          </n-layout-sider>
          <n-layout>
            <n-layout-header bordered class="h-16 flex items-center justify-between px-6">
              <div class="flex items-center">
                <h2 class="text-lg font-medium">
                  {{ pageTitle }}
                </h2>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">{{ user?.username }}</span>
                <theme-switch variant="admin" />
                <n-button circle quaternary @click="goHome">
                  <template #icon>
                    <i class="i-tabler-home" />
                  </template>
                </n-button>
                <n-button circle quaternary @click="handleLogout">
                  <template #icon>
                    <i class="i-tabler-logout" />
                  </template>
                </n-button>
              </div>
            </n-layout-header>
            <n-layout-content class="p-6" content-style="padding: 24px;">
              <slot />
            </n-layout-content>
          </n-layout>
        </n-layout>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>
