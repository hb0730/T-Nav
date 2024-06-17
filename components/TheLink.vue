<script setup lang="ts">
import LinksData from '~/data/links'
</script>

<template>
  <div class="link flex flex-col gap-1 text-sm ">
    <h3 class="mb-4 text-2xl font-bold">
      友情链接
    </h3>
    <n-card hoverable>
      <div class="flex flex-wrap gap-1 card-content">
        <n-button v-for="link in LinksData" :key="link.title" text ghost class="link-item" tag="a" :href="link.url" :alt="link.title">
          {{ link.title }}
        </n-button>
        <n-button text ghost tag="a" class="link-item" href="/links" alt="更多链接">
          更多链接
        </n-button>
      </div>
    </n-card>
  </div>
</template>

<style lang="scss" scoped>
.link {
  margin-bottom: 64px;

  .card-content {
    display: flex;
    flex-wrap: wrap;
  }
  .link-item {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    padding: 4px 8px;
    border-radius: 4px;
    color: var(--n-text-color);
    &:before {
      content: '\2022';
      display: inline-block;
      position: relative;
      margin-right: 5px;
    }
    &:hover {
      color: var(--n-text-color-hover);
    }
  }
}
</style>
