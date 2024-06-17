<script setup lang="ts">
import Website from '~/components/Website.vue'
import menuDataList from '~/data/menu'
</script>

<template>
  <div>
    <Website :model-value="menuDataList" />
    <TheLink />
  </div>
</template>
