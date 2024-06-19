<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { Grid } from '@vicons/ionicons5'
import type { MenuItem } from '~/data/menu'

const requestUrl = useRequestURL()
const menuList = defineModel <Array<MenuItem>> ({
  type: Array,
  default: () => [],
})
// 是否为首页
const index = computed(() => requestUrl.pathname === '/')
const menuOptions = computed(() => {
  return menuList.value.map((item) => {
    return {
      key: item.title,
      // 两者滚动动画不同
      label: () => h('a', { href: `${index.value ? '' : '/'}#${item.title}`, onClick: aTagClick }, item.title),
      icon: () => h(NIcon, null, { default: () => h(item.icon ?? Grid) }),
    }
  })
})
/**
 * @description 点击菜单
 */
function handleMenuItemClick(key: string) {
  // scrollIntoView()定位元素显示导致页面上移,使用scrollIntoViewIfNeeded()解决
  document.getElementById(key)?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'start',
  })
}

/**
 * @description 点击a标签, 如果为首页则不跳转
 */
function aTagClick(e: Event) {
  if (index.value) {
    e.preventDefault()
  }
}

onMounted(() => {
  const hash = requestUrl?.hash
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
