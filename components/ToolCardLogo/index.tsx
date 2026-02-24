import DefaultLogo from '~/assets/imgs/site/header-logo.png'
import TheIcon from '../TheIcon'

export default defineComponent({
  name: 'ToolCardLogo',
  props: {
    logo: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const isDefaultLogo = computed(() => props.logo === null || props.logo === undefined || props.logo === '')
    const isPathIcon = computed(() => props.logo && (props.logo.startsWith('/') || props.logo.startsWith('http') || props.logo.startsWith('data:image')))
    const isIcon = computed(() => props.logo && !isPathIcon.value)
    const logo = computed(() => {
      if (isIcon.value) {
        return <TheIcon icon={props.logo} class="w-full h-full text-4xl" />
      }
      return (
        <img
          height="auto"
          width="auto"
          class={isDefaultLogo.value ? 'background-color:var(--logo-bg)' : ''}
          src={props.logo || DefaultLogo}
          loading="lazy"
          alt={props.title}
          data-was-processed="true"
          data-src={props.logo || DefaultLogo}
        >
        </img>
      )
    })
    return () => (
      <>
        {logo.value}
      </>
    )
  },
})
