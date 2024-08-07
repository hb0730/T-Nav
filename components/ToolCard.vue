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
    <n-card class="tool-card" hoverable>
      <n-tooltip placement="bottom" trigger="" width="trigger">
        <template #trigger>
          <div class="card-content">
            <div class="content">
              <div class="logo">
                <img
                  height="auto"
                  width="auto"
                  :class="{ 'default-logo': isDefaultLogo }"
                  :src="model.logo || DefaultLogo" loading="lazy"
                  :alt="model.title"
                  data-was-processed="true"
                  :data-src="model.logo || DefaultLogo"
                >
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
    &:hover {
      border-color: var(--n-color-target);
      // // 阴影突出 灰色 0.1
      box-shadow: 2px 2px 20px var(--n-color-target);
    }
  }
  .card-content {
    display: flex;
    flex-direction: column;
  }
  .content {
    display: flex;
    align-items: center;
    overflow: hidden;
    .logo {
      width: 64px;
      height: 64px;
      overflow: hidden;
      display: flex;
      align-items: center;
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
  @media screen and (min-width: 768px) {
    .content {
      height: 86px;
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
