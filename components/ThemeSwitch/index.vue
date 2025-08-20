<script setup lang="ts">
import type { DropdownOption } from 'naive-ui'
import { useThemePlugin } from '~/plugins/theme/composables/useThemePlugin'

interface Props {
  variant?: 'default' | 'admin'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const { setTheme } = useThemePlugin()

// 直接使用与 app.vue 相同的 cookie 状态
const themePreferenceCookie = useCookie('theme-preference', { 
  default: () => 'system',
  sameSite: 'lax'
})
const themeActualCookie = useCookie('theme-actual', { 
  default: () => 'light',
  sameSite: 'lax'
})

// 创建与 app.vue 一致的主题信息
const themeInfo = computed(() => {
  const preference = themePreferenceCookie.value
  const actual = themeActualCookie.value

  return {
    preference,
    actual,
    icon: preference === 'system'
      ? 'i-tabler-device-desktop'
      : actual === 'dark'
        ? 'i-tabler-moon'
        : 'i-tabler-sun',
    label: preference === 'system'
      ? `跟随系统 (${actual === 'dark' ? '深色' : '浅色'})`
      : actual === 'dark'
        ? '深色模式'
        : '浅色模式',
  }
})

const themeOptions = computed<DropdownOption[]>(() => [
  {
    label: '浅色模式',
    key: 'light',
    icon: () => h('i', { class: 'i-tabler-sun' }),
    props: {
      class: themePreferenceCookie.value === 'light' ? 'selected-theme' : '',
    },
  },
  {
    label: '深色模式',
    key: 'dark',
    icon: () => h('i', { class: 'i-tabler-moon' }),
    props: {
      class: themePreferenceCookie.value === 'dark' ? 'selected-theme' : '',
    },
  },
  {
    label: '跟随系统',
    key: 'system',
    icon: () => h('i', { class: 'i-tabler-device-desktop' }),
    props: {
      class: themePreferenceCookie.value === 'system' ? 'selected-theme' : '',
    },
  },
])

function handleSelect(key: string) {
  setTheme(key as 'light' | 'dark' | 'system')
}

// 监听客户端的主题变化，确保图标状态同步
if (import.meta.client) {
  // 监听 cookie 变化（通过轮询检测）
  let lastPreference = themePreferenceCookie.value
  let lastActual = themeActualCookie.value
  
  setInterval(() => {
    const currentPreference = document.cookie
      .split('; ')
      .find(row => row.startsWith('theme-preference='))
      ?.split('=')[1] || 'system'
    const currentActual = document.cookie
      .split('; ')
      .find(row => row.startsWith('theme-actual='))
      ?.split('=')[1] || 'light'
    
    if (currentPreference !== lastPreference) {
      lastPreference = currentPreference
      themePreferenceCookie.value = currentPreference as any
    }
    if (currentActual !== lastActual) {
      lastActual = currentActual
      themeActualCookie.value = currentActual as any
    }
  }, 100) // 每100ms检查一次
}
</script>

<template>
  <n-dropdown
    trigger="hover"
    :options="themeOptions"
    :show-arrow="true"
    placement="bottom"
    @select="handleSelect"
  >
    <n-button
      circle
      :ghost="props.variant === 'default'"
      :quaternary="props.variant === 'admin'"
      :class="props.variant === 'default' ? 'c-button text-5' : ''"
      :title="themeInfo.label"
    >
      <i :class="themeInfo.icon" />
    </n-button>
  </n-dropdown>
</template>

<style scoped>
:deep(.selected-theme) {
  background-color: var(--n-option-color-hover);
  font-weight: 600;
}

:deep(.n-dropdown-option-body) {
  padding: 8px 12px;
}

:deep(.n-dropdown-option-body__prefix) {
  margin-right: 8px;
}
</style>
