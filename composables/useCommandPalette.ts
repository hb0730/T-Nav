export function useCommandPalette() {
  const commandActive = useState('commandActive', () => false)
  const textCommand = useState('commandText', () => {
    // client or server  mac/windows
    if (import.meta.client) {
      if (navigator.userAgent.toLowerCase().includes('mac')) {
        return '⌘ + K'
      }
      else {
        return 'Ctrl + K'
      }
    }
    else {
      if (process.platform === 'darwin') {
        return '⌘ + K'
      }
      else {
        return 'Ctrl + K'
      }
    }
  })
  // listener command
  const handleCommand = (e: KeyboardEvent) => {
    if (e.metaKey && e.key === 'k') {
      e.preventDefault()
      commandActive.value = true
      return
    }
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault()
      commandActive.value = true
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleCommand)
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', handleCommand)
  })
  return {
    commandActive,
    textCommand,
  }
}
