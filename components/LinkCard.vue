<script setup lang="ts">
import type { MenuItem } from '~/data/menu'

const model = defineModel<MenuItem>({ required: true })
</script>

<template>
  <NuxtLink :id="model.title" :to="model.url" target="_blank" class="decoration-none">
    <n-card class="tool-card" hoverable>
      <div class="card-content">
        <div class="logo">
          <img :src="model.logo">
        </div>
        <div class="flex-1 flex flex-col align-center justify-center ml-4 overflow-hidden">
          <div class="title text-sm font-bold text-gray-700 truncate overflow-hidden">
            {{ model.title }}
          </div>
          <div class="description text-sm text-gray-500 mt-2 text-clip overflow-hidden">
            {{ model.description }}
          </div>
        </div>
      </div>
    </n-card>
  </NuxtLink>
</template>

<style lang="scss" scoped>
.tool-card {
  width: 100%;
  border-radius: 8px;
  &:hover {
    border-color: var(--n-color-target);
  }

  .card-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    .logo {
      width: 64px;
      height: 64px;
      --webkit-box-flex: 0;
      flex: none;
      background: rgba(128, 128, 128, 0.1);
      overflow: hidden;
    }
    .title {
      color: var(--n-text-color);
    }
    .description {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
    }
  }
  @media screen and (max-width: 768px) {
    :deep(.n-card__content) {
      padding: 0;
    }
    .card-content {
      .logo {
        width: 48px;
        height: 48px;
      }
      .description {
        display: none;
      }
    }
  }
}
</style>
