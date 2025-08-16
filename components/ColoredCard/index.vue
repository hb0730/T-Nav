<script setup lang="ts">
const props = defineProps<{ icon: string, title: string }>()
const { icon, title } = toRefs(props)
</script>

<template>
  <n-card class="colored-card">
    <i class="inline-block text-9 icon" :class="[icon]" />
    <n-h3 class="title">
      <n-ellipsis>{{ title }}</n-ellipsis>
    </n-h3>
    <div class="description">
      <slot />
    </div>
  </n-card>
</template>

<style lang="scss" scoped>
html.dark {
  .colored-card {
    background: rgb(19 72 85);
    background: linear-gradient(48deg, #134854 0%, #0f4552 60%, #0a404e 100%);
  }
}

.colored-card {
  background: rgb(27, 117, 140);
  background: linear-gradient(48deg, #1c758c 0%, #1385a2 60%, #02a6cf 100%);
  color: white;
  border: none;
  overflow: hidden;
  word-wrap: break-word;

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
    word-wrap: break-word;
    overflow-wrap: break-word;
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
