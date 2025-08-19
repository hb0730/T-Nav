<script setup lang="ts">
import type { DropdownOption } from 'naive-ui'
import { useTheme } from '~/composables/useTheme'

interface Props {
  variant?: 'default' | 'admin'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const { themeInfo, setTheme, themePreference } = useTheme()

const themeOptions = computed<DropdownOption[]>(() => [
  {
    label: '浅色模式',
    key: 'light',
    icon: () => h('i', { class: 'i-tabler-sun' }),
    props: {
      class: themePreference.value === 'light' ? 'selected-theme' : '',
    },
  },
  {
    label: '深色模式',
    key: 'dark',
    icon: () => h('i', { class: 'i-tabler-moon' }),
    props: {
      class: themePreference.value === 'dark' ? 'selected-theme' : '',
    },
  },
  {
    label: '跟随系统',
    key: 'system',
    icon: () => h('i', { class: 'i-tabler-device-desktop' }),
    props: {
      class: themePreference.value === 'system' ? 'selected-theme' : '',
    },
  },
])

function handleSelect(key: string) {
  setTheme(key as 'light' | 'dark' | 'system')
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
