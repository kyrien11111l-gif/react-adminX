import type { MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import { useLayoutStore } from '@/stores/layout'
import type { ThemeMode } from '@/types'

type AnimatedThemeMode = Exclude<ThemeMode, 'system'>

type ThemeTransitionTrigger = Pick<
  MouseEvent<HTMLElement>,
  'currentTarget' | 'clientX' | 'clientY' | 'detail'
>

let transitionRunning = false

function applyTheme(nextTheme: AnimatedThemeMode) {
  flushSync(() => {
    document.documentElement.dataset.theme = nextTheme
    useLayoutStore.getState().setThemeMode(nextTheme)
  })
}

function clearTransitionStyles() {
  document.documentElement.style.removeProperty('--theme-transition-x')
  document.documentElement.style.removeProperty('--theme-transition-y')
  document.documentElement.style.removeProperty('--theme-transition-radius')
}

export function transitionToTheme(
  nextTheme: AnimatedThemeMode,
  event?: ThemeTransitionTrigger
) {
  const { darkMode, setThemeMode, setThemeTransitioning } =
    useLayoutStore.getState()

  if (transitionRunning || useLayoutStore.getState().themeTransitioning) {
    return
  }

  if (darkMode === (nextTheme === 'dark')) {
    setThemeMode(nextTheme)
    return
  }

  const supportsViewTransition = typeof document.startViewTransition === 'function'

  if (!supportsViewTransition) {
    applyTheme(nextTheme)
    return
  }

  const bounds = event?.currentTarget.getBoundingClientRect()
  const fallbackX = bounds
    ? bounds.left + bounds.width / 2
    : window.innerWidth / 2
  const fallbackY = bounds
    ? bounds.top + bounds.height / 2
    : window.innerHeight / 2
  const x = event && event.detail !== 0 ? event.clientX : fallbackX
  const y = event && event.detail !== 0 ? event.clientY : fallbackY
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  document.documentElement.style.setProperty('--theme-transition-x', `${x}px`)
  document.documentElement.style.setProperty('--theme-transition-y', `${y}px`)
  document.documentElement.style.setProperty(
    '--theme-transition-radius',
    `${endRadius}px`
  )

  transitionRunning = true
  setThemeTransitioning(true)

  let viewTransition: ReturnType<NonNullable<Document['startViewTransition']>>

  try {
    viewTransition = document.startViewTransition(() => applyTheme(nextTheme))
  } catch {
    clearTransitionStyles()
    transitionRunning = false
    setThemeTransitioning(false)
    applyTheme(nextTheme)
    return
  }

  void viewTransition.finished
    .catch(() => undefined)
    .finally(() => {
      clearTransitionStyles()
      transitionRunning = false
      useLayoutStore.getState().setThemeTransitioning(false)
    })
}
