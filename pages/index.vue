<script setup lang="ts">
import Website from '~/components/Website.vue'
import menuDataList from '~/data/menu'
</script>

<template>
  <div class="pt-50px">
    <div class="grid-wrapper">
      <Website :model-value="menuDataList" />
      <TheLink />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.height-enter-active,
.height-leave-active {
  transition: all 0.5s ease-in-out;
  overflow: hidden;
  max-height: 500px;
}

.height-enter-from,
.height-leave-to {
  max-height: 42px;
  overflow: hidden;
  opacity: 0;
  margin-bottom: 0;
}
</style>
