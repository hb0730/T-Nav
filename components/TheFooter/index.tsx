export default defineComponent({
  name: 'TheFooter',
  setup() {
    const siteConfig = useSiteConfig()

    return () => (
      <>
        <div class="flex flex-col items-center justify-center text-sm text-gray-500">
          <span>
            © 2024
            {' '}
            <n-button text tag="a" target="_blank" href={siteConfig.value.authorLink} ghost type="primary">{ siteConfig.value.author }</n-button>
          </span>
          <span>
            Powered by
            {' '}
            <n-button text tag="a" target="_blank" href="https://hb0730.me" ghost type="primary">hb0730</n-button>
          </span>
          <span>
            Theme by
            {' '}
            <n-button text tag="a" target="_blank" href="https://it-tools.tech/" ghost type="primary">it-tools </n-button>
          </span>
          {siteConfig.value.icp && (
            <span class="icp m-t-2" text-decoration="underline">
              <n-button text tag="a" target="_blank" href="https://beian.miit.gov.cn/" ghost type="primary">{ siteConfig.value.icp }</n-button>
            </span>
          )}
        </div>
      </>
    )
  },
})
