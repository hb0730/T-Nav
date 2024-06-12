<script setup lang="ts">
import { type MenuOption, NIcon } from 'naive-ui'
import { Grid } from '@vicons/ionicons5'
import type { MenuItem } from '~/data/menu'

const menuList = defineModel <Array<MenuItem>> ({
  type: Array,
  default: () => [],
})

const menuOptions = computed(() => {
  return menuList.value.map((item) => {
    return {
      key: item.title,
      label: item.title,
      icon: () => h(NIcon, null, { default: () => h(item.icon ?? Grid) }),
    }
  })
})

/**
 * @description 点击菜单
 */
function handleMenuItemClick(key: string, _: MenuOption) {
  document.getElementById(key)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="side-menu">
    <n-menu
      :options="menuOptions"
      :collapsed-width="64"
      :icon-size="25"
      @update:value="handleMenuItemClick"
    />
  </div>
</template>

<style lang="scss" scoped>
.side-menu {
  height: 100%;
  overflow: auto;
  .n-menu-item-content {
    .n-icon {
      margin-right: 8px;
    }
  }
}
</style>
