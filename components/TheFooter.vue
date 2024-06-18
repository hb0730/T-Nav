<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
  <div class="copy-right text-sm text-gray-500">
    <span>Copyright © 2024 - {{ new Date().getFullYear() }}</span>
    <span>Powered by
      <n-button text tag="a" target="_blank" :href="appConfig.siteAuthorLink" ghost type="primary">{{ appConfig.siteAuthor }}</n-button>
    </span>
    <span v-if="appConfig.siteICP" class="icp">
      <n-button text tag="a" target="_blank" href="https://beian.miit.gov.cn/">{{ appConfig.siteICP }}</n-button>
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
