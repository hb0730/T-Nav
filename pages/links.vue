<script setup lang="ts">
import LinksData from '~/data/links'

const appConfig = useAppConfig()

useHead({
  title: `友情链接 | ${appConfig.siteTitle}`,
})
</script>

<template>
  <!-- 居中 -->
  <div class="container">
    <h3 class="mb-4 text-2xl font-bold">
      友情链接
    </h3>
    <!-- 响应式 pc 三个一行，移动端两个 -->
    <n-grid cols="xs:2 sm:2 md:2 lg:3" :x-gap="12" :y-gap="12" responsive="screen">
      <n-grid-item
        v-for="link in LinksData"
        :key="link.title"
      >
        <NuxtLink :id="link.title" :to="link.url" target="_blank" class="decoration-none">
          <n-card class="tool-card" hoverable tag="a" :href="link.url" target="_blank" :alt="link.title">
            <div class="card-content">
              <div class="logo">
                <img :src="link.logo">
              </div>
              <div class="flex-1 flex flex-col align-center justify-center ml-4 overflow-hidden">
                <div class="title text-sm font-bold text-gray-700 truncate overflow-hidden">
                  {{ link.title }}
                </div>
                <div class="description text-sm text-gray-500 mt-2 text-clip overflow-hidden">
                  {{ link.description }}
                </div>
              </div>
            </div>
          </n-card>
        </NuxtLink>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<style lang="scss" scoped>
.container {
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}

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

@media screen and (max-width: 768px) {
  .container {
    max-width: 540px;
  }
}
@media screen and (min-width: 768px) {
  .container {
    max-width: 720px;
  }
}

@media screen and (min-width: 992px) {
  .container {
    max-width: 960px;
  }
}
@media screen and (min-width: 1200px) {
  .container {
    max-width: 1140px;
  }
}
</style>
