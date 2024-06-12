<script setup lang="ts">
import type { MenuItem } from '~/data/menu'
import DefaultLogo from '~/assets/images/header-logo.png'

const model = defineModel<MenuItem>({
  type: Object,
  default: () => ({}),
})
const isDefaultLogo = computed(() => model.value.logo === null || model.value.logo === undefined)
</script>

<template>
  <NuxtLink :id="model.title" :to="model.url" target="_blank" class="decoration-none">
    <n-card class="tool-card" hoverable tag="a" :href="model.url" target="_blank" :alt="model.title">
      <div class="tool-card-content">
        <div class="card-head flex items-center ">
          <div class="card-logo">
            <img :class="{ 'default-logo': isDefaultLogo }" :src="model.logo ?? DefaultLogo">
          </div>
          <div class="card-title">
            {{ model.title }}
          </div>
        </div>
        <n-tooltip placement="bottom" trigger="hover" width="trigger">
          <template #trigger>
            <div class="card-description text-sm text-gray-500 mt-2 text-clip overflow-hidden">
              {{ model.description }}
            </div>
          </template>
          {{ model.description }}
        </n-tooltip>
      </div>
    </n-card>
  </NuxtLink>
</template>

<style lang="scss" scoped>
/* 遵循父类元素的宽度*/
.decoration-none {
  .tool-card {
    width: 100%;
    border-radius: 8px;
  }

  .tool-card-content {
    .card-head {
      .card-logo {
        width: 40px;
        height: 40px;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
        }
      }

      .card-title {
        margin-left: 8px;
        font-weight: 600;
        font-size: 16px;
        line-height: 24px;
        color: var(--n-text-color);
      }
    }
    .card-description {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
  }

  .default-logo {
    background-color: var(--logo-bg);
  }
}
</style>
