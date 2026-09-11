import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Button, Menu as AntMenu, Layout, theme } from 'antd'
import type { MenuProps } from 'antd'
import SimpleBar from 'simplebar-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH
} from '@/constants'
import { useLayoutStore, usePermissionStore } from '@/stores'
import type { Menu } from '@/types'
import {
  buildMenuItems,
  collectMenuPaths,
  matchCurrentMenu,
  resolveMenuUrl
} from '@/utils/menu'
import { BrandLogo } from '@/layouts/pageLayout/brandLogo'

interface SidebarProps {
  collapsed?: boolean
  onNavigate?: () => void
  mobile?: boolean
  menus?: Menu[]
  parentPath?: string
  showBrand?: boolean
}

export function Sidebar({
  collapsed = false,
  onNavigate,
  mobile = false,
  menus,
  parentPath = '',
  showBrand = true
}: SidebarProps) {
  const storeMenus = usePermissionStore((state) => state.menus)
  const darkMode = useLayoutStore((state) => state.darkMode)
  const toggleCollapsed = useLayoutStore((state) => state.toggleCollapsed)
  const location = useLocation()
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const navigationMenus = menus ?? storeMenus
  const items = useMemo(
    () => buildMenuItems(navigationMenus, parentPath),
    [navigationMenus, parentPath]
  )
  const pathEntries = useMemo(
    () => collectMenuPaths(navigationMenus, parentPath),
    [navigationMenus, parentPath]
  )
  const currentMenu = useMemo(
    () => matchCurrentMenu(location.pathname, pathEntries),
    [location.pathname, pathEntries]
  )
  const routeSelectedKeys = useMemo(
    () =>
      currentMenu
        ? [...currentMenu.ancestors, currentMenu.key]
        : [],
    [currentMenu]
  )
  // rc-menu registers nested paths after rendering; update the controlled
  // selection in a microtask so parent submenus receive their selected state.
  const [selectedKeys, setSelectedKeys] = useState(routeSelectedKeys)
  useEffect(() => {
    let active = true

    queueMicrotask(() => {
      if (active) {
        setSelectedKeys(routeSelectedKeys)
      }
    })

    return () => {
      active = false
    }
  }, [routeSelectedKeys])
  const [openState, setOpenState] = useState<{
    pathname: string
    keys: string[]
  }>({ pathname: location.pathname, keys: currentMenu?.ancestors ?? [] })
  const openKeys =
    openState.pathname === location.pathname
      ? openState.keys
      : (currentMenu?.ancestors ?? [])

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const entry = pathEntries.find((item) => item.key === key)

    if (entry?.link) {
      const url = resolveMenuUrl(entry.link)

      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
      }

      onNavigate?.()
      return
    }

    void navigate(key)
    onNavigate?.()
  }

  return (
    <Layout.Sider
      className={
        mobile
          ? 'h-full border-e border-e-[var(--ant-color-border-secondary)] !bg-[var(--ant-color-bg-container)] !transition-[flex,max-width,min-width,width]'
          : 'sticky top-0 h-dvh overflow-hidden border-e border-e-[var(--ant-color-border-secondary)] !bg-[var(--ant-color-bg-container)] !transition-[flex,max-width,min-width,width] max-[991px]:hidden'
      }
      width={SIDEBAR_WIDTH}
      collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
      collapsed={mobile ? false : collapsed}
      trigger={null}
      theme={darkMode ? 'dark' : 'light'}
      aria-label="侧边导航"
      styles={{
        root: {
          boxShadow: token.boxShadowSecondary
        },
        body: {
          background: token.colorBgContainer
        }
      }}
      classNames={{
        body: 'flex h-full flex-col'
      }}
    >
      {showBrand ? (
        <BrandLogo collapsed={mobile ? false : collapsed} />
      ) : null}

      <nav className="min-h-0 flex-1" aria-label="主导航">
        <SimpleBar className="h-full">
          <div className="py-2">
            <AntMenu
              theme={darkMode ? 'dark' : 'light'}
              mode="inline"
              inlineCollapsed={mobile ? false : collapsed}
              items={items}
              selectedKeys={selectedKeys}
              openKeys={collapsed || mobile ? undefined : openKeys}
              onOpenChange={(keys) => {
                if (collapsed && !mobile) {
                  return
                }

                setOpenState({ pathname: location.pathname, keys })
              }}
              onClick={handleMenuClick}
              className="border-e-0! !bg-[var(--ant-color-bg-container)] px-2"
            />
          </div>
        </SimpleBar>
      </nav>
      {!mobile ? (
        <Button
          type="text"
          block
          className="min-h-12 w-full shrink-0 justify-center !rounded-none !border-t !border-t-[var(--ant-color-border-secondary)] px-0"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
          onClick={toggleCollapsed}
        />
      ) : null}
    </Layout.Sider>
  )
}
