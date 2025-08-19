import { useGlobal } from '~/composables/useGlobal'
import { useTheme } from '~/composables/useTheme'
import './index.scss'

export default defineComponent({
  name: 'TheHeader',
  setup() {
    const { toggleNavCollapse, navCollapse } = useGlobal()
    const { themeInfo } = useTheme()
    const navCollapseIcon = computed(() => {
      return navCollapse.value ? 'i-tabler-indent-decrease' : 'i-tabler-indent-increase'
    })
    return () => (
      <>
        <n-layout-header id="navbar" bordered class="nav-wrapper flex items-center justify-between  h-$header-aside p-x-6 position-sticky top-0">
          <div class="nav-left">
            <n-button circle ghost onClick={toggleNavCollapse}>
              <i class={[navCollapseIcon.value, 'text-5']}></i>
            </n-button>
          </div>
          <div class="nav-main flex-1 flex items-center justify-center m-x-3">
            <the-command-palette></the-command-palette>
          </div>
          <div class="nav-right flex items-center">
            <n-tooltip trigger="hover" placement="bottom">
              {{
                trigger: () => (
                  <theme-switch />
                ),
                default: () => (
                  <span>{themeInfo.value.label}</span>
                ),
              }}
            </n-tooltip>
            <n-tooltip trigger="hover" placement="bottom">
              {{
                trigger: () => (
                  <>
                    <n-button circle ghost tag="a" href="#" class="c-button">
                      <i class="i-tabler-info-circle text-5"></i>
                    </n-button>
                  </>
                ),
                default: () => (
                  <span>关于我们</span>
                ),
              }}
            </n-tooltip>
            <n-tooltip trigger="hover" placement="bottom">
              {{
                trigger: () => (
                  <>
                    <n-button
                      circle
                      ghost
                      tag="a"
                      href="https://github.com/hb0730/T-Nav"
                      target="_blank"
                      class="c-button"
                    >
                      <i class="i-tabler-brand-github text-5"></i>
                    </n-button>
                  </>
                ),
                default: () => (
                  <span>Github</span>
                ),
              }}
            </n-tooltip>
          </div>
        </n-layout-header>
      </>
    )
  },
})
