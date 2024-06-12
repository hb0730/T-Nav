<script setup lang="ts">
import ToolCard from './ToolCard.vue'
import type { MenuItem } from '~/data/menu'

const modeList = defineModel<Array<MenuItem>>({
  type: Array,
  default: () => [],
})
</script>

<template>
  <div v-for="item in modeList" :id="item.title" :key="item.title" class="website">
    <h3 class="mb-4 text-2xl font-bold">
      {{ item.title }}
    </h3>
    <n-grid cols="md:1 lg:4" :x-gap="12" :y-gap="12" responsive="screen">
      <!-- 移动端独占一行，pc一行四个 -->
      <n-grid-item
        v-for="tool in item.children"
        :key="tool.title"
      >
        <ToolCard :model-value="tool" />
      </n-grid-item>
    </n-grid>
  </div>
</template>

<style lang="scss" scoped>
.website {
  margin-bottom: 64px;
}
</style>
