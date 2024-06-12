export function useGlobal() {
  // 当前window宽度
  const innerWidth = useState('windowWidth', (): number => 0)

  // 设置当前window宽度
  const setInnerWidth = (width: number) => {
    innerWidth.value = width
  }

  // style
  const isDark = useState('isDark', () => false)
  const toggleDark = () => {
    isDark.value = !isDark.value
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }

  //

  return { innerWidth, setInnerWidth, isDark, toggleDark }
}
