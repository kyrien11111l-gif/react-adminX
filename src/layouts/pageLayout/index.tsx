import { Layout } from 'antd'
import SimpleBar from 'simplebar-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import {
  MIXED_NAVIGATION,
  MOBILE_LAYOUT_MEDIA_QUERY,
  SIDE_NAVIGATION,
  TOP_NAVIGATION,
  TWO_COLUMN_NAVIGATION
} from '@/constants'
import { useLayoutStore, usePermissionStore } from '@/stores'
import { findTopLevelMenu, joinMenuPath } from '@/utils/menu'
import { BrandLogo } from '@/layouts/pageLayout/brandLogo'
import { Header } from '@/layouts/pageLayout/header'
import { MobileSidebar } from '@/layouts/pageLayout/mobileSidebar'
import { PageTabs } from '@/layouts/pageLayout/pageTabs'
import { Sidebar } from '@/layouts/pageLayout/sidebar'
import { TopNavigation } from '@/layouts/pageLayout/topNavigation'
import { TwoColumnNavigation } from '@/layouts/pageLayout/twoColumnNavigation'

export function PageLayout() {
  const outlet = useOutlet()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(MOBILE_LAYOUT_MEDIA_QUERY).matches
  )
  const collapsed = useLayoutStore((state) => state.collapsed)
  const contentMaximized = useLayoutStore((state) => state.contentMaximized)
  const navigationStyle = useLayoutStore((state) => state.navigationStyle)
  const menus = usePermissionStore((state) => state.menus)

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

  const currentNavigationStyle = isMobile ? SIDE_NAVIGATION : navigationStyle
  const activeTopMenu = useMemo(
    () => findTopLevelMenu(location.pathname, menus),
    [location.pathname, menus]
  )
  const activeTopPath = activeTopMenu
    ? joinMenuPath('', activeTopMenu.path)
    : ''
  const activeTopChildren = activeTopMenu?.children
  const activeSidebarMenus = useMemo(() => {
    if (!activeTopMenu) {
      return []
    }

    return activeTopChildren?.length ? activeTopChildren : [activeTopMenu]
  }, [activeTopChildren, activeTopMenu])
  const activeSidebarParentPath = activeTopChildren?.length
    ? activeTopPath
    : ''
  const isTopNavigation = currentNavigationStyle === TOP_NAVIGATION
  const isTwoColumnNavigation =
    currentNavigationStyle === TWO_COLUMN_NAVIGATION
  const isMixedNavigation = currentNavigationStyle === MIXED_NAVIGATION
  const hasSidebar =
    currentNavigationStyle === SIDE_NAVIGATION ||
    isTwoColumnNavigation ||
    (isMixedNavigation && activeSidebarMenus.length > 0)
  const headerNavigation = isTopNavigation ? (
    <div className="flex h-full min-w-0 items-center">
      <BrandLogo
        className="!w-auto shrink-0 ps-2 pe-4"
        collapsed={false}
      />
      <TopNavigation menus={menus} className="h-full" />
    </div>
  ) : isMixedNavigation ? (
    <TopNavigation
      menus={menus}
      className="h-full"
      topLevelOnly={isMixedNavigation}
    />
  ) : undefined

  return (
    <Layout
      className="h-dvh overflow-hidden"
      hasSider={!contentMaximized && hasSidebar}
    >
      {!contentMaximized && currentNavigationStyle === SIDE_NAVIGATION ? (
        <Sidebar collapsed={collapsed} />
      ) : null}

      {!contentMaximized && isTwoColumnNavigation ? (
        <TwoColumnNavigation menus={menus} />
      ) : null}

      {!contentMaximized && isMixedNavigation && activeSidebarMenus.length ? (
        <Sidebar
          collapsed={collapsed}
          menus={activeSidebarMenus}
          parentPath={activeSidebarParentPath}
        />
      ) : null}

      {isMobile ? (
        <MobileSidebar
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      ) : null}

      <Layout className="h-full min-h-0 min-w-0">
        {!contentMaximized ? (
          <Header
            navigation={headerNavigation}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />
        ) : null}
        <PageTabs />
        <Layout.Content
          className="min-h-0 min-w-0 flex-1 overflow-hidden bg-[var(--ant-color-bg-layout)]"
        >
          <SimpleBar className="h-full [&_.simplebar-content-wrapper]:h-full [&_.simplebar-content]:h-full [&_.simplebar-content]:min-h-0">
            <div className="flex h-full min-h-0 flex-col p-2 min-[576px]:p-4">
              {outlet}
            </div>
          </SimpleBar>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
