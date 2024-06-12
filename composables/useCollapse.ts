export function useCollapse() {
  const viewport = useViewport()
  // 菜单折叠状态
  const navCollapse = useState('navCollapse', () => viewport.isLessThan('desktop'))
  const toggleNavCollapse = () => {
    navCollapse.value = !navCollapse.value
  }
  const setNavCollapse = (collapse: boolean) => {
    navCollapse.value = collapse
  }

  // 是否小屏幕
  const isSmallScreen = useState('isSmallScreen', () => viewport.isLessThan('desktop'))
  const setSmallScreen = (smallScreen: boolean) => {
    isSmallScreen.value = smallScreen
  }

  return { navCollapse, isSmallScreen, toggleNavCollapse, setNavCollapse, setSmallScreen }
}
