<script setup lang="ts">
import HeaderLogo from '~/assets/imgs/site/header-logo.png'
import { useGlobal } from '~/composables/useGlobal'

const { navCollapse, isSmallScreen, isMobile, toggleNavCollapse } = useGlobal()

// 从API获取菜单数据
let menuDataList: any[] = []
try {
  const menuResponse = await $fetch<{ success: boolean, data: any[] }>('/api/menu')
  menuDataList = menuResponse?.data || []
}
catch (error) {
  console.error('Failed to fetch menu data:', error)
  // 如果API失败，使用空数组作为后备
  menuDataList = []
}
</script>

<template>
  <n-layout has-sider class="h-100vh min-h-full" bg="#f0f2f5">
    <n-layout-sider
      v-if="!isMobile || !navCollapse"
      bordered
      collapse-mode="width"
      :collapsed-width="0"
      :width="240"
      :show-trigger="false"
      :native-scrollbar="false"
      :collapsed="navCollapse"
      class="z-99"
      :position="isSmallScreen ? 'absolute' : 'static'"
    >
      <NuxtLink to="/" class="absolute block left-0 w-full z-10" overflow="hidden" bg="$n-color">
        <div class="h-30 flex items-center justify-center" bg="$logo-bg">
          <img :src="HeaderLogo" alt="logo">
        </div>
      </NuxtLink>
      <div class="p-t-40 p-b-50">
        <TheMenu :model-value="menuDataList" />
      </div>
      <div class="text-center m-t-5 p-y-5" color="#838587">
        <TheFooter />
      </div>
    </n-layout-sider>
    <n-layout class="content">
      <TheHeader />
      <n-layout-content position="absolute" class="c-content" content-style="padding: 24px;">
        <n-back-top />
        <slot />
      </n-layout-content>
      <div v-show="isSmallScreen && !navCollapse" class="content-mask" @click="toggleNavCollapse" />
    </n-layout>
  </n-layout>
</template>

<style lang="scss" scoped>
.content-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #00000080;
  cursor: pointer;
}

.c-content {
  top: var(--header-aside) !important;
}
</style>
