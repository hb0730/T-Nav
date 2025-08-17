import { Icon } from '@iconify/vue'

export default defineComponent({
  name: 'TheIcon',
  props: {
    icon: {
      type: String,
      default: '',
    },
    src: {
      type: String,
      default: '',
    },
  },
  setup(props, { attrs }) {
    // 是否使用在线图标
    const isUseOnline = computed(() => props.icon?.startsWith('iconify-'))
    const isIcon = computed(() => !!props.icon)

    return () => {
      if (isUseOnline.value) {
        // 使用在线图标
        const icon = props.icon?.replace('iconify-', '')
        return (
          <Icon
            icon={icon}
            {...attrs}
          />
        )
      }

      return (
        <>
          {isIcon.value ? <i class={props.icon} {...attrs}></i> : <img src={props.src} alt="icon" {...attrs} />}
        </>
      )
    }
  },
})
