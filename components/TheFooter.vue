<script setup lang="ts">
// const appConfig = useAppConfig()
const siteConfig = useSiteConfig()
</script>

<template>
  <div class="copy-right text-sm text-gray-500">
    <span>© 2024 <n-button text tag="a" target="_blank" :href="siteConfig.authorLink" ghost type="primary">{{ siteConfig.author }}</n-button>
    </span>
    <span>Powered by
      <n-button text tag="a" target="_blank" href="https://hb0730.me" ghost type="primary">hb0730</n-button>
    </span>
    <span>Theme by
      <n-button text tag="a" target="_blank" href="https://it-tools.tech/" ghost type="primary">it-tools </n-button>
    </span>
    <span v-if="siteConfig.icp" class="icp">
      <n-button text tag="a" target="_blank" href="https://beian.miit.gov.cn/" ghost type="primary">{{ siteConfig.icp }}</n-button>
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
