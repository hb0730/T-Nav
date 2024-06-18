<script setup lang="ts">
import { IndentDecrease, IndentIncrease, InfoCircle, MoonStars, Search, Sun } from '@vicons/tabler'
import { useCollapse } from '../composables/useCollapse'
import { useGlobal } from '../composables/useGlobal'
import Github from '~/assets/svg/github.svg?component'

const { navCollapse, toggleNavCollapse } = useCollapse()
const { isDark, toggleDark } = useGlobal()
</script>

<template>
  <n-layout-header class="nav-wrapper" bordered>
    <div class="nav-left">
      <n-button circle ghost @click="toggleNavCollapse">
        <n-icon :size="25">
          <IndentIncrease v-if="navCollapse" />
          <IndentDecrease v-else />
        </n-icon>
      </n-button>
    </div>
    <div class="nav-main">
      <CommandPalette />
    </div>
    <div class="nav-right">
      <n-tooltip trigger="hover" placement="bottom">
        <template #trigger>
          <n-button circle ghost class="c-button" @click="toggleDark">
            <n-icon :size="25">
              <Sun v-if="isDark" />
              <MoonStars v-else />
            </n-icon>
          </n-button>
        </template>
        {{ isDark ? '明亮模式' : '暗黑模式' }}
      </n-tooltip>
      <n-tooltip trigger="hover" placement="bottom">
        <template #trigger>
          <n-button circle ghost class="c-button" tag="a">
            <n-icon :size="25">
              <InfoCircle />
            </n-icon>
          </n-button>
        </template>
        关于我们
      </n-tooltip>
      <n-tooltip trigger="hover" placement="bottom">
        <template #trigger>
          <n-button
            circle
            ghost
            tag="a"
            href="https://github.com/hb0730/T-Nav"
            target="_blank"
            class="c-button"
          >
            <n-icon :size="25">
              <Github />
            </n-icon>
          </n-button>
        </template>
        GitHub
      </n-tooltip>
    </div>
  </n-layout-header>
</template>

<style lang="scss" scoped>
.nav-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-aside);
  padding: 0 24px;
  .nav-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 12px;
  }
  .nav-right {
    display: flex;
    align-items: center;
    .c-button {
      margin-left: 12px;
    }
  }
}
</style>
