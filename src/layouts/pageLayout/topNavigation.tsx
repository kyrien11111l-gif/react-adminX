import { Menu as AntMenu } from 'antd'
import type { MenuProps } from 'antd'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLayoutStore, usePermissionStore } from '@/stores'
import {
  buildMenuItems,
  collectMenuPaths,
  findTopLevelMenu,
  findFirstLeafPath,
  findMenuByPath,
  joinMenuPath,
  matchCurrentMenu,
  resolveMenuUrl,
  stripMenuChildren
} from '@/utils/menu'
import type { Menu } from '@/types'

interface TopNavigationProps {
  menus?: Menu[]
  className?: string
  topLevelOnly?: boolean
}

const emptyMenus: Menu[] = []

export function TopNavigation({
  menus = emptyMenus,
  className,
  topLevelOnly = false
}: TopNavigationProps) {
  const storeMenus = usePermissionStore((state) => state.menus)
  const headerHeight = useLayoutStore((state) => state.headerHeight)
  const location = useLocation()
  const navigate = useNavigate()
  const navigationMenus = menus.length ? menus : storeMenus
  const displayMenus = useMemo(
    () => (topLevelOnly ? stripMenuChildren(navigationMenus) : navigationMenus),
    [navigationMenus, topLevelOnly]
  )
  const items = useMemo(
    () => buildMenuItems(displayMenus),
    [displayMenus]
  )
  const pathEntries = useMemo(
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
  const activeMenuKey = topLevelOnly
    ? activeTopKey
    : matchCurrentMenu(location.pathname, pathEntries)?.key ?? activeTopKey

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const entry = pathEntries.find((item) => item.key === key)

    if (entry?.link) {
      const url = resolveMenuUrl(entry.link)

      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
      }

      return
    }

    const clickedMenu = findMenuByPath(navigationMenus, key)
    const targetKey = topLevelOnly && clickedMenu?.children?.length
      ? findFirstLeafPath(clickedMenu)
      : key

    void navigate(targetKey ?? key)
  }

  return (
    <AntMenu
      mode="horizontal"
      theme="light"
      items={items}
      selectedKeys={activeMenuKey ? [activeMenuKey] : []}
      onClick={handleMenuClick}
      style={{
        height: headerHeight,
        lineHeight: `${headerHeight}px`
      }}
      className={`!min-w-0 !flex-1 ${className ?? ''}`}
    />
  )
}
