import { MenuOutlined } from '@ant-design/icons'
import { Button, Layout, theme } from 'antd'
import { useEffect, useState, type ReactNode } from 'react'
import { MOBILE_LAYOUT_MEDIA_QUERY } from '@/constants'
import { AppBreadcrumb } from '@/layouts/pageLayout/breadcrumb'
import { HeaderActions } from '@/layouts/pageLayout/headerActions'
import { SettingsDrawer } from '@/layouts/pageLayout/settingsDrawer'
import { useLayoutStore } from '@/stores'

interface HeaderProps {
  onOpenMobileMenu: () => void
  navigation?: ReactNode
}

function useMobileHeaderMenu() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(MOBILE_LAYOUT_MEDIA_QUERY).matches
  )

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia(MOBILE_LAYOUT_MEDIA_QUERY)
    const handleChange = () => setIsMobile(mediaQuery.matches)

    handleChange()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isMobile
}

export function Header({ onOpenMobileMenu, navigation }: HeaderProps) {
  const { token } = theme.useToken()
  const showMobileMenu = useMobileHeaderMenu()
  const headerHeight = useLayoutStore((state) => state.headerHeight)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <Layout.Header
      className="box-border w-full min-w-0 shrink-0 [&.ant-layout-header]:flex [&.ant-layout-header]:flex-nowrap [&.ant-layout-header]:items-center [&.ant-layout-header]:justify-between [&.ant-layout-header]:!px-4 [&.ant-layout-header]:leading-normal"
      style={{
        background: token.colorBgContainer,
        height: headerHeight
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        {showMobileMenu ? (
          <Button
            type="text"
            icon={<MenuOutlined />}
            className="inline-flex"
            shape="circle"
            aria-label="打开导航菜单"
            onClick={onOpenMobileMenu}
          />
        ) : null}
        <div className="min-w-0 flex-1 overflow-hidden">
          {navigation ?? <AppBreadcrumb />}
        </div>
      </div>
      <div className="flex shrink-0 items-center">
        <HeaderActions onOpenSettings={() => setSettingsOpen(true)} />
      </div>
      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </Layout.Header>
  )
}
