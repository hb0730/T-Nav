<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { Grid } from '@vicons/ionicons5'
import type { MenuItem } from '~/data/menu'

const requestUrl = useRequestURL()
const menuList = defineModel <Array<MenuItem>> ({
  type: Array,
  default: () => [],
})

const menuOptions = computed(() => {
  return menuList.value.map((item) => {
    return {
      key: item.title,
      label: () => h('a', { href: `/#${item.title}` }, item.title),
      icon: () => h(NIcon, null, { default: () => h(item.icon ?? Grid) }),
    }
  })
})
/**
 * @description 点击菜单
 */
function handleMenuItemClick(key: string) {
  document.getElementById(key)?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  const hash = requestUrl?.hash
  console.log(hash)
  if (hash) {
    // 解码 url解码
    const decodeHash = decodeURIComponent(hash.slice(1))
    handleMenuItemClick(decodeHash)
  }
})
</script>

<template>
  <div class="side-menu">
    <n-menu
      :options="menuOptions"
      :collapsed-width="64"
      :icon-size="25"
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
