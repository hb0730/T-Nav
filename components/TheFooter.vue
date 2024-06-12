<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
  <div class="copy-right text-sm text-gray-500">
    <span>Copyright © 2024 - {{ new Date().getFullYear() }}</span>
    <span>Powered by <a href="https://github.com/hb0730" class="link" target="_blank">hb0730</a></span>
    <span v-if="appConfig.icp" class="icp">
      <a href="https://beian.miit.gov.cn/" target="_blank">{{ appConfig.icp }}</a>
    </span>
  </div>
</template>

<style lang="scss" scoped>
.copy-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .link {
    color: var(--n-text-color);
    &:hover {
      color: var(--n-text-color-hover);
    }
  }
  .icp {
    margin-top: 8px;
    text-decoration: underline;
  }
}
</style>
