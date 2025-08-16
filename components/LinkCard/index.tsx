import type { FriendLink } from '~/types/database'
import styles from './index.module.scss'

export default defineComponent({
  name: 'LinkCard',
  props: {
    modelValue: {
      type: Object as PropType<FriendLink>,
      default: () => ({}),
    },

  },
  setup(props, { attrs }) {
    const model = props.modelValue
    return () => (
      <>
        <nuxt-link {...attrs} id={model.title} to={model.url} target="_blank">
          <n-card class={styles['tool-card']} hoverable>
            <div class={styles['card-content']}>
              <div class={styles.logo}>
                <img src={model.logo} />
              </div>
              <div class="flex-1 flex flex-col  justify-center ml-4 overflow-hidden">
                <div class={['text-sm font-bold text-gray-700 truncate overflow-hidden', styles.title]}>
                  {model.title }
                </div>
                <div class={['text-sm text-gray-500 mt-2 text-clip overflow-hidden', styles.description]}>
                  { model.description }
                </div>
              </div>
            </div>
          </n-card>
        </nuxt-link>
      </>
    )
  },
})
