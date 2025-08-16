import styles from './index.module.scss'

export default defineComponent({
  name: 'TheLink',
  async setup() {
    // 获取友情链接数据
    const { data: friendsData } = await $fetch<{ success: boolean, data: any[] }>('/api/friends')
    const LinksData = friendsData || []

    return () => (
      <>
        <div class={['link mb-16 flex flex-col gap-1 text-sm ', styles.link]}>
          <h3 class="mb-4 text-2xl font-bold">
            友情链接
          </h3>
          <n-card hoverable>
            <div class="flex flex-wrap gap-1">
              {LinksData.map((link, index) => (
                <n-button
                  key={`${link.title}-${index}`}
                  text
                  ghost
                  class={styles['link-item']}
                  tag="a"
                  href={link.url}
                  target="_blank"
                  alt={link.title}
                >
                  {link.title}
                </n-button>
              ))}
              <n-button
                text
                ghost
                tag="a"
                class={styles['link-item']}
                href="/links"
                alt="更多链接"
              >
                更多链接
              </n-button>
            </div>
          </n-card>
        </div>
      </>
    )
  },
})
