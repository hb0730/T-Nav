<script setup lang="ts">
import { useCollapse } from '~/composables/useCollapse'
import { useGlobal } from '~/composables/useGlobal'
import HeaderLogo from '~/assets/images/header-logo.png'
import menuDataList from '~/data/menu'

const { navCollapse, isSmallScreen, setNavCollapse, setSmallScreen, toggleNavCollapse } = useCollapse()
const { innerWidth } = useGlobal()

watch(
  innerWidth,
  () => {
    if (innerWidth.value < 768) {
      setNavCollapse(true)
      setSmallScreen(true)
    }
    else {
      setNavCollapse(false)
      setSmallScreen(false)
    }
  },
)
</script>

<template>
  <n-layout has-sider class="content-wrapper">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="0"
      :width="240"
      :show-trigger="false"
      :native-scrollbar="false"
      :collapsed="navCollapse"
      class="aside-wrapper"
      :position="isSmallScreen ? 'absolute' : 'static'"
    >
      <NuxtLink to="/" class="logo-wrapper">
        <div class="logo">
          <img :src="HeaderLogo">
        </div>
      </NuxtLink>
      <div class="aside-content">
        <TheAside :model-value="menuDataList" />
      </div>
      <div class="aside-footer">
        <TheFooter />
      </div>
    </n-layout-sider>
    <n-layout class="content">
      <TheHeader />
      <n-layout-content class="c-content" position="absolute" content-style="padding: 24px;">
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
.content-wrapper {
  height: 100vh;
  min-height: 100%;
  background: #f0f2f5;
  .aside-wrapper {
    z-index: 99;
    .logo-wrapper {
      position: absolute;
      display: block;
      left: 0;
      width: 100%;
      z-index: 10;
      overflow: hidden;
      background: var(--n-color);
      .logo {
        background-color: var(--logo-bg);
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .text-wrapper {
        position: absolute;
        left: 0;
        width: 100%;
        text-align: center;
        top: 16px;
        color: #fff;

        .title {
          font-size: 25px;
          font-weight: 600;
        }

        .divider {
          width: 50px;
          height: 2px;
          border-radius: 4px;
          margin: 0 auto 5px;
        }

        .subtitle {
          font-size: 16px;
        }
      }
    }
    .aside-content {
      padding-top: 160px;
      padding-bottom: 200px;
    }
    .aside-footer {
      text-align: center;
      color: #838587;
      margin-top: 20px;
      padding: 20px 0;
    }
  }

  .c-content {
    top: var(--header-aside);
  }
}
</style>
