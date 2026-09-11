import { useLayoutStore } from '@/stores/layout'

const STARTUP_LOADING_ID = 'app-startup-loading'
const STARTUP_LOADING_STYLE_ID = 'app-startup-loading-style'
const pendingHideHandlers = new WeakMap<HTMLElement, () => void>()

function getStartupLoadingElement() {
  const element = document.getElementById(STARTUP_LOADING_ID)

  return element instanceof HTMLElement ? element : null
}

function setupStartupLoadingStyle() {
  if (document.getElementById(STARTUP_LOADING_STYLE_ID)) {
    return
  }

  const style = document.createElement('style')
  style.id = STARTUP_LOADING_STYLE_ID
  style.textContent = `
    #${STARTUP_LOADING_ID} {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: var(--app-background);
      pointer-events: none;
      opacity: 1;
      transition: opacity 200ms ease-out, visibility 200ms ease-out;
    }

    #${STARTUP_LOADING_ID}[data-state='hidden'] {
      visibility: hidden;
      opacity: 0;
    }

    .app-startup-loading__indicator {
      width: 36px;
      height: 36px;
      border: 3px solid rgb(22 119 255 / 20%);
      border-color: color-mix(
        in srgb,
        var(--ant-color-primary, var(--app-primary, #1677ff)) 20%,
        transparent
      );
      border-top-color: var(--ant-color-primary, var(--app-primary, #1677ff));
      border-radius: 50%;
      animation: app-startup-loading-spin 720ms linear infinite;
    }

    .app-startup-loading__label {
      color: var(--app-secondary-text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 16px;
    }

    @keyframes app-startup-loading-spin {
      to {
        transform: rotate(360deg);
      }
    }
  `
  document.head.append(style)
}

function applyStartupLoadingTheme() {
  const { darkMode, themeColorPrimary, themeMode } = useLayoutStore.getState()
  const systemDarkMode =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = themeMode === 'system' ? systemDarkMode : darkMode

  document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  document.documentElement.style.setProperty('--app-primary', themeColorPrimary)
}

export function showStartupLoading() {
  const existingElement = getStartupLoadingElement()

  if (existingElement) {
    if (existingElement.dataset.state !== 'hidden') {
      return
    }

    const pendingHideHandler = pendingHideHandlers.get(existingElement)

    if (pendingHideHandler) {
      existingElement.removeEventListener(
        'transitionend',
        pendingHideHandler
      )
      pendingHideHandlers.delete(existingElement)
    }

    applyStartupLoadingTheme()
    existingElement.dataset.state = 'visible'
    return
  }

  setupStartupLoadingStyle()

  const element = document.createElement('div')
  const indicator = document.createElement('span')
  const label = document.createElement('span')

  element.id = STARTUP_LOADING_ID
  element.dataset.state = 'visible'
  applyStartupLoadingTheme()
  element.setAttribute('role', 'status')
  element.setAttribute('aria-label', '正在加载应用')
  element.setAttribute('aria-live', 'polite')
  indicator.className = 'app-startup-loading__indicator'
  indicator.setAttribute('aria-hidden', 'true')
  label.className = 'app-startup-loading__label'
  label.textContent = '正在加载中…'
  element.append(indicator, label)
  document.body.prepend(element)
}

export function hideStartupLoading() {
  const element = getStartupLoadingElement()

  if (!element || element.dataset.state === 'hidden') {
    return
  }

  element.dataset.state = 'hidden'
  const pendingHideHandler = () => {
    pendingHideHandlers.delete(element)
    element.remove()
  }

  pendingHideHandlers.set(element, pendingHideHandler)
  element.addEventListener('transitionend', pendingHideHandler, {
    once: true
  })
}
