import ToolCard from '../ToolCard'
import { useGlobal } from '~/composables/useGlobal'

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
  name: 'Website',
  props: {
    modelValue: {
      type: Array as PropType<MenuItem[]>,
      default: () => [],
    },
  },

  setup(props) {
    const { isSmallScreen } = useGlobal()
    
    return () => (
      <>
        {props.modelValue.map(item => (
          <div id={item.title} key={item.title} class="m-b-17">
            <h3 class={['mb-4 font-bold', isSmallScreen.value ? 'text-xl' : 'text-2xl']}>
              {item.title}
            </h3>
            <div class="grid grid-cols-1 gap-[12px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {item.children?.filter(tool => !tool.deprecated).map(tool => (
                <ToolCard modelValue={tool} key={tool.title} />
              ))}
            </div>
          </div>
        ))}
      </>
    )
  },
})
