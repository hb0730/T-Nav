<script setup lang="ts">
import { darkTheme } from 'naive-ui'
import { darkThemeOverrides, lightThemeOverrides } from './themes'
import { breakpoints } from './config'
import { useGlobal } from '~/composables/useGlobal'

const { setInnerWidth, isDark, toggleDark } = useGlobal()

const theme = computed(() => isDark.value ? darkTheme : null)
const themeOverrides = computed(() => isDark?.value ? darkThemeOverrides : lightThemeOverrides)

function getWindowWidth() {
  setInnerWidth(window.innerWidth)
}

onMounted(() => {
  // 获取窗口宽度
  getWindowWidth()
  // 监听窗口变化
  window.addEventListener('resize', getWindowWidth)
  // 监听主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (e.matches) {
      toggleDark()
    }
    else {
      toggleDark()
    }
  })
})

onBeforeUnmount(() => {
  // 取消监听窗口变化
  window.removeEventListener('resize', getWindowWidth)
  // 取消监听主题变化
  window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', (e) => {
    if (e.matches) {
      toggleDark()
    }
    else {
      toggleDark()
    }
  })
})
</script>

<template>
  <ClientOnly>
    <n-config-provider :breakpoints="breakpoints" :theme="theme" :theme-overrides="themeOverrides">
      <n-global-style />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </n-config-provider>
  </ClientOnly>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
