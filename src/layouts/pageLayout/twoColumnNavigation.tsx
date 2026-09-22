import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import {
  Button,
  ConfigProvider,
  Layout,
  Menu as AntMenu,
  theme
} from 'antd'
import type { MenuProps } from 'antd'
import SimpleBar from 'simplebar-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH
} from '@/constants'
import { useLayoutStore, usePermissionStore } from '@/stores'
import { BrandLogo } from '@/layouts/pageLayout/brandLogo'
import { useMenuSelectedKeys } from '@/layouts/pageLayout/useMenuSelectedKeys'
import type { Menu } from '@/types'
import {
  buildMenuItems,
  collectMenuPaths,
  findFirstLeafPath,
  findMenuByPath,
  findTopLevelMenu,
  joinMenuPath,
  matchCurrentMenu,
  resolveMenuUrl,
  stripMenuChildren
} from '@/utils/menu'

interface TwoColumnNavigationProps {
  menus?: Menu[]
}

const emptyMenus: Menu[] = []

export function TwoColumnNavigation({
  menus = emptyMenus
}: TwoColumnNavigationProps) {
  const storeMenus = usePermissionStore((state) => state.menus)
  const collapsed = useLayoutStore((state) => state.collapsed)
  const toggleCollapsed = useLayoutStore((state) => state.toggleCollapsed)
  const location = useLocation()
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const navigationMenus = menus.length ? menus : storeMenus
  const displayMenus = useMemo(
    () => stripMenuChildren(navigationMenus),
    [navigationMenus]
  )
  const firstColumnItems = useMemo(
    () => buildMenuItems(displayMenus),
    [displayMenus]
  )
  const navigationPathEntries = useMemo(
    () => collectMenuPaths(navigationMenus),
    [navigationMenus]
  )
  const activeTopMenu = useMemo(
    () => findTopLevelMenu(location.pathname, navigationMenus),
    [location.pathname, navigationMenus]
  )
  const activeTopKey = activeTopMenu
    ? joinMenuPath('', activeTopMenu.path)
    : undefined
  const activeTopPath = activeTopMenu ? activeTopKey : ''
  const secondColumnHasChildren = Boolean(activeTopMenu?.children?.length)
  const secondColumnParentPath = secondColumnHasChildren ? activeTopPath : ''
  const secondColumnMenus = useMemo(() => {
    if (!activeTopMenu) {
      return []
    }

    return secondColumnHasChildren
      ? activeTopMenu.children ?? []
      : [activeTopMenu]
  }, [activeTopMenu, secondColumnHasChildren])
  const secondColumnItems = useMemo(
    () => buildMenuItems(secondColumnMenus, secondColumnParentPath),
    [secondColumnMenus, secondColumnParentPath]
  )
  const secondColumnPathEntries = useMemo(
    () => collectMenuPaths(secondColumnMenus, secondColumnParentPath),
    [secondColumnMenus, secondColumnParentPath]
  )
  const currentSecondColumnMenu = useMemo(
    () => matchCurrentMenu(location.pathname, secondColumnPathEntries),
    [location.pathname, secondColumnPathEntries]
  )
  const [openState, setOpenState] = useState<{
    pathname: string
    keys: string[]
  }>({
    pathname: location.pathname,
    keys: currentSecondColumnMenu?.ancestors ?? []
  })
  const openKeys =
    openState.pathname === location.pathname
      ? openState.keys
      : (currentSecondColumnMenu?.ancestors ?? [])
  const selectedSecondColumnKeys = useMenuSelectedKeys(
    currentSecondColumnMenu
  )
  const secondColumnWidth = secondColumnMenus.length
    ? collapsed
      ? SIDEBAR_COLLAPSED_WIDTH
      : SIDEBAR_WIDTH
    : 0
  const totalWidth = SIDEBAR_COLLAPSED_WIDTH + secondColumnWidth

  const handleFirstColumnClick: MenuProps['onClick'] = ({ key }) => {
    const entry = navigationPathEntries.find((item) => item.key === key)

    if (entry?.link) {
      const url = resolveMenuUrl(entry.link)

      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
      }

      return
    }

    const clickedMenu = findMenuByPath(navigationMenus, key)
    const targetKey = clickedMenu?.children?.length
      ? findFirstLeafPath(clickedMenu)
      : key

    void navigate(targetKey ?? key)
  }

  const handleSecondColumnClick: MenuProps['onClick'] = ({ key }) => {
    const entry = secondColumnPathEntries.find((item) => item.key === key)

    if (entry?.link) {
      const url = resolveMenuUrl(entry.link)

      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
      }

      return
    }

    void navigate(key)
  }

  return (
    <Layout.Sider
      width={totalWidth}
      collapsedWidth={totalWidth}
      collapsed={false}
      trigger={null}
      theme="light"
      aria-label="双列导航"
      className="sticky top-0 h-dvh overflow-hidden !bg-[var(--ant-color-bg-container)] !transition-[flex,max-width,min-width,width] max-[991px]:hidden"
      styles={{
        root: {
          boxShadow: token.boxShadowSecondary
        },
        body: {
          background: token.colorBgContainer
        }
      }}
      classNames={{
        body: 'flex h-full min-w-0 flex-col'
      }}
    >
      <div className="flex h-full min-w-0">
        <div
          className="flex h-full shrink-0 flex-col border-e border-e-[var(--ant-color-border-secondary)]"
          style={{ width: SIDEBAR_COLLAPSED_WIDTH }}
        >
          <BrandLogo collapsed />
          <nav className="min-h-0 flex-1" aria-label="一级导航菜单">
            <SimpleBar className="h-full">
              <ConfigProvider
                theme={{
                  components: {
                    Menu: {
                      itemSelectedBg: 'var(--ant-color-bg-container)',
                      itemSelectedColor: 'var(--ant-color-primary)'
                    }
                  }
                }}
              >
                <AntMenu
                  mode="inline"
                  theme="light"
                  inlineCollapsed
                  items={firstColumnItems}
                  selectedKeys={activeTopKey ? [activeTopKey] : []}
                  onClick={handleFirstColumnClick}
                  className="border-e-0! !bg-[var(--ant-color-bg-container)] px-2"
                />
              </ConfigProvider>
            </SimpleBar>
          </nav>
        </div>

        {secondColumnMenus.length ? (
          <div
            className="flex h-full min-w-0 shrink-0 flex-col border-e border-e-[var(--ant-color-border-secondary)] !transition-[width]"
            style={{ width: secondColumnWidth }}
          >
            <nav className="min-h-0 flex-1" aria-label="二级导航菜单">
              <SimpleBar className="h-full">
                <div className="py-2">
                  <AntMenu
                    theme="light"
                    mode="inline"
                    inlineCollapsed={collapsed}
                    items={secondColumnItems}
                    selectedKeys={selectedSecondColumnKeys}
                    openKeys={collapsed ? undefined : openKeys}
                    onOpenChange={(keys) => {
                      if (collapsed) {
                        return
                      }

                      setOpenState({ pathname: location.pathname, keys })
                    }}
                    onClick={handleSecondColumnClick}
                    className="border-e-0! !bg-[var(--ant-color-bg-container)] px-2"
                  />
                </div>
              </SimpleBar>
            </nav>
            <Button
              type="text"
              block
              className="min-h-12 w-full shrink-0 justify-center !rounded-none !border-t !border-t-[var(--ant-color-border-secondary)] px-0"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              aria-label={collapsed ? '展开二级导航' : '收起二级导航'}
              onClick={toggleCollapsed}
            />
          </div>
        ) : null}
      </div>
    </Layout.Sider>
  )
}
