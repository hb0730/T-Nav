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
    <div class="grid grid-cols-1 gap-[12px] lg:grid-cols-4">
      <ToolCard v-for="tool in item.children" :key="tool.title" :model-value="tool" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.website {
  margin-bottom: 64px;
}
</style>
