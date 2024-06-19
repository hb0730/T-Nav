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
    <div class="grid grid-cols-2 gap-[12px] lg:grid-cols-3">
      <LinkCard v-for="link in LinksData" :key="link.title" :model-value="link" />
    </div>
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
