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
      <n-tooltip placement="bottom" trigger="hover" width="trigger">
        <template #trigger>
          <div class="card-content">
            <div class="content">
              <div class="logo">
                <img :class="{ 'default-logo': isDefaultLogo }" :src="model.logo || DefaultLogo">
              </div>
              <div class="flex-1 flex flex-col align-center justify-center ml-4">
                <div class="title text-lg font-bold text-gray-700 truncate overflow-hidden">
                  {{ model.title }}
                </div>
                <div class="description text-sm text-gray-500 mt-2 text-clip overflow-hidden">
                  {{ model.description }}
                </div>
              </div>
            </div>
            <div v-if="model.tags" class="tags w-full mt-4 text-sm text-gray-500 flex gap-1 flex-wrap  pt-2">
              <n-button
                v-for="tag in model.tags"
                :key="tag"
                class="tag"
                tag="span"
                size="tiny"
                secondary
              >
                {{ tag }}
              </n-button>
            </div>
          </div>
        </template>
        {{ model.description }}
      </n-tooltip>
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
  .card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .content {
    display: flex;
    align-items: center;
    overflow: hidden;
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
    }
    .title {
      color: var(--n-text-color);
    }
    .description {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
  }
  .tags {
    border-top: 1px solid rgba(136, 136, 136, 0.2);
  }
  .tag {
  }

  .default-logo {
    background-color: var(--logo-bg);
  }
}
</style>
