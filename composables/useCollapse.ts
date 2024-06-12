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
  return { navCollapse, toggleNavCollapse, setNavCollapse }
}
