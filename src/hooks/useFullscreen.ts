import { useEffect, useState, type RefObject } from 'react'

export function useFullscreen(target?: RefObject<Element | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const syncFullscreenState = () => {
      const targetElement = target?.current
      setIsFullscreen(
        Boolean(
          document.fullscreenElement &&
            (!targetElement || document.fullscreenElement === targetElement)
        )
      )
    }

    syncFullscreenState()
    const handleFullscreenChange = () => syncFullscreenState()
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [target])

  async function toggleFullscreen() {
    if (typeof document === 'undefined') {
      return
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }

    const element = target?.current ?? document.documentElement
    await element.requestFullscreen()
  }

  return { isFullscreen, toggleFullscreen }
}
