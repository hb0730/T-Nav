import component from '../types/shims-vue';
<script setup lang="ts">
const props = defineProps<{ icon: Component, title: string }>()
const { icon, title } = toRefs(props)
</script>

<template>
  <n-card class="colored-card">
    <n-icon :component="icon" class="icon" size="40" />
    <n-h3 class="title">
      <n-ellipsis>{{ title }}</n-ellipsis>
    </n-h3>
    <div class="description">
      <n-ellipsis :line-clamp="2" :tooltip="false">
        <slot />
      </n-ellipsis>
    </div>
  </n-card>
</template>

<style lang="scss" scoped>
.colored-card {
  background: rgb(27, 117, 140);
  background-image: linear-gradient(
    48deg,
    #1b758c 0%,
    #8591c5 60%,
    #cda6b5 100%
  );
  color: white;
  border: none;

  .icon {
    opacity: 0.7;
  }

  .title {
    color: white;
    margin: 5px 0;
  }
  .description {
    opacity: 0.8;
    margin: 5px 0;
    ::v-deep(a) {
      color: inherit;
      text-decoration: underline;
      font-weight: bold;
      transition: color ease 0.2s;

      &:hover {
        color: rgb(20, 20, 20);
      }
    }
  }
}
</style>
