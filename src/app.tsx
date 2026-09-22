import { App as AntApp, ConfigProvider, theme, Watermark } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useEffect, useMemo } from 'react'
import { RouterProvider } from 'react-router-dom'
import { SIDEBAR_COLLAPSED_WIDTH } from '@/constants'
import { router } from '@/router'
import { registerUnauthorizedHandler } from '@/services'
import { useLayoutStore } from '@/stores'
import { createLoginUrl } from '@/utils/navigation'
import { resetSession } from '@/utils/session'

function AppRuntime() {
  const darkMode = useLayoutStore((state) => state.darkMode)
  const themeMode = useLayoutStore((state) => state.themeMode)
  const setDarkMode = useLayoutStore((state) => state.setDarkMode)
  const { notification } = AntApp.useApp()

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
  }, [darkMode])

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      setDarkMode(themeMode === 'dark')
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const syncTheme = () => {
      const nextDarkMode =
        themeMode === 'system' ? mediaQuery.matches : themeMode === 'dark'

      if (useLayoutStore.getState().darkMode !== nextDarkMode) {
        setDarkMode(nextDarkMode)
      }
    }

    syncTheme()

    if (themeMode !== 'system') {
      return
    }

    mediaQuery.addEventListener('change', syncTheme)
    return () => mediaQuery.removeEventListener('change', syncTheme)
  }, [setDarkMode, themeMode])

  useEffect(
    () =>
      registerUnauthorizedHandler(() => {
        resetSession()
        notification.warning({
          key: 'session-expired',
          message: '登录状态已失效',
          description: '请重新登录后继续操作。',
          duration: 3
        })
        const { pathname, search, hash } = router.state.location
        const target = `${pathname}${search}${hash}`

        return router.navigate(createLoginUrl(target), { replace: true })
      }),
    [notification]
  )

  return <RouterProvider router={router} />
}

function AppWatermark() {
  const watermarkEnabled = useLayoutStore((state) => state.watermarkEnabled)
  const watermarkContent = useLayoutStore((state) => state.watermarkContent)
  const content = watermarkEnabled ? watermarkContent.trim() : ''

  return (
    <Watermark className="min-h-dvh" content={content}>
      <AppRuntime />
    </Watermark>
  )
}

export function App() {
  const darkMode = useLayoutStore((state) => state.darkMode)
  const themeColorPrimary = useLayoutStore(
    (state) => state.themeColorPrimary
  )
  const lightNavigationToken = useMemo(
    () =>
      theme.getDesignToken({
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: themeColorPrimary
        }
      }),
    [themeColorPrimary]
  )

  return (
    <ConfigProvider
      locale={zhCN}
      input={{ autoComplete: "off" }}
      theme={{
        cssVar: {},
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: themeColorPrimary
        },
        components: {
          Button: {
            dangerShadow: 'none',
            defaultShadow: 'none',
            primaryShadow: 'none'
          },
          Layout: darkMode
            ? {
                siderBg: 'var(--ant-color-bg-container)'
              }
            : {},
          Menu: {
            collapsedWidth: SIDEBAR_COLLAPSED_WIDTH,
            horizontalItemHoverColor: 'var(--ant-color-text)',
            horizontalItemSelectedColor: lightNavigationToken.colorPrimary,
            itemBg: 'var(--ant-color-bg-container)',
            itemHoverColor: 'var(--ant-color-text)',
            itemSelectedBg: lightNavigationToken.colorPrimaryBg,
            itemSelectedColor: lightNavigationToken.colorPrimary,
            popupBg: 'var(--ant-color-bg-container)',
            subMenuItemBg: 'var(--ant-color-bg-container)',
            subMenuItemSelectedColor: lightNavigationToken.colorPrimary
          },
          Table: {
            headerBorderRadius: 4
          }
        }
      }}
    >
      <AntApp message={{ maxCount: 1 }} notification={{ placement: 'topRight' }}>
        <AppWatermark />
      </AntApp>
    </ConfigProvider>
  )
}
