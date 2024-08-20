<script setup lang="ts">
import { Heart } from '@vicons/tabler'
import Website from '~/components/Website.vue'
import menuDataList from '~/data/menu'

const siteConfig = useSiteConfig()
</script>

<template>
  <div class="pt-50px">
    <div class="grid-wrapper">
      <div class="grid grid-cols-1 gap-[12px] lg:grid-cols-4">
        <ColoredCard id="home" :title="siteConfig.name" :icon="Heart">
          如需申请友链，收录站点，请前往
          <a
            href="https://github.com/hb0730/T-Nav/issues"
            rel="noopener"
            target="_blank"
            aria-label="GitHub"
          >GitHub</a> 提交 issue 申请吧。
        </ColoredCard>
      </div>
      <div class="mt-[25px]">
        <Website :model-value="menuDataList" />
        <TheLink />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.grid-wrapper {
}
</style>
