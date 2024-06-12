<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
  <div class="copy-right text-sm text-gray-500">
    <span>Copyright © 2024 - {{ new Date().getFullYear() }}</span>
    <span>Powered by <template v-if="appConfig.siteAuthorLink"><a :href="appConfig.siteAuthorLink" class="link" target="_blank">{{ appConfig.siteAuthor }}</a></template><template v-else><span class="link">{{ appConfig.siteAuthor }}</span></template></span>
    <span v-if="appConfig.siteICP" class="icp">
      <a href="https://beian.miit.gov.cn/" target="_blank">{{ appConfig.siteICP }}</a>
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
