import DefaultLogo from '~/assets/imgs/site/header-logo.png'
import styles from './index.module.scss'

interface MenuItem {
  title: string
  icon?: string
  url?: string
  logo?: string
  description?: string
  deprecated?: boolean
  children?: MenuItem[]
  tags?: string[]
}

export default defineComponent({
  name: 'ToolCard',
  props: {
    modelValue: {
      type: Object as PropType<MenuItem>,
      default: () => ({}),
    },
  },
  setup(props) {
    const model = props.modelValue

    const isDefaultLogo = computed(() => model.logo === null || model.logo === undefined)
    const isPathIcon = computed(() => model.logo && (model.logo.startsWith('/') || model.logo.startsWith('http') || model.logo.startsWith('data:image')))
    const isIcon = computed(() => model.logo && !isPathIcon.value)
    const isDeprecated = computed(() => model.deprecated)

    const logo = computed(() => {
      if (isIcon.value) {
        return <i class={[model.logo, 'w-full h-full']}></i>
      }
      return (
        <img
          height="auto"
          width="auto"
          class={isDefaultLogo.value ? styles['default-logo'] : ''}
          src={model.logo || DefaultLogo}
          loading="lazy"
          alt={model.title}
          data-was-processed="true"
          data-src={model.logo || DefaultLogo}
        >
        </img>
      )
    })
    return () => (
      <>
        <nuxt-link id={model.title} to={isDeprecated.value ? '' : model.url} target="_blank" class={[styles['decoration-none'], isDeprecated.value && 'grayscale']}>
          <n-card hoverable class={['w-full', styles['tool-card']]} border="rounded-2">
            <n-tooltip placement="bottom" trigger="" width="trigger">
              {{
                trigger: () => (
                  <>
                    <div class={['flex flex-col', styles['card-content']]}>
                      <div class="flex items-start flex-1" overflow="hidden">
                        <div class="w-16 h-16 flex items-center justify-center flex-shrink-0" overflow="hidden">
                          {logo.value}
                        </div>
                        <div class="flex-1 flex flex-col ml-4 justify-between min-h-16">
                          <div>
                            <div class={[['text-lg font-bold text-gray-700 truncate overflow-hidden mb-1'], isDeprecated.value && 'line-through']} color="$n-text-color">
                              {model.title}
                            </div>
                            <div class={[styles.description, 'text-sm text-gray-500 text-clip overflow-hidden']}>
                              { model.description || '暂无描述' }
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class={['w-full mt-3 text-sm text-gray-500 flex gap-1 pt-2 overflow-hidden min-h-8 flex-shrink-0', styles.tags]}>
                        { model.tags && model.tags.length > 0
                          ? (
                              model.tags.map(tag => (
                                <n-button
                                  class="tag"
                                  tag="span"
                                  size="tiny"
                                  secondary
                                >
                                  { tag }
                                </n-button>
                              ))
                            )
                          : (
                              <span class="text-xs text-gray-400 italic">暂无标签</span>
                            )}
                      </div>
                    </div>
                  </>
                ),
                default: () => (
                  <>
                    <span>{model.description}</span>
                  </>
                ),
              }}
            </n-tooltip>
          </n-card>
        </nuxt-link>
      </>
    )
  },
})
