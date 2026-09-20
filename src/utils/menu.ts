import { createElement } from 'react'
import type { MenuProps } from 'antd'
import { MENU_ICON_MAP } from '@/constants'
import type { Menu, MenuPathEntry } from '@/types'

type AntMenuItem = Required<MenuProps>['items'][number]

export function joinMenuPath(parentPath: string, path: string): string {
  const joined = `${parentPath}/${path}`.replace(/\/+/g, '/')
  return joined.startsWith('/') ? joined : `/${joined}`
}

export function buildMenuItems(menus: Menu[], parentPath = ''): AntMenuItem[] {
  return menus
    .filter((menu) => menu.meta?.hidden !== true)
    .sort((left, right) => (left.meta?.rank ?? 0) - (right.meta?.rank ?? 0))
    .map((menu) => {
      const key = joinMenuPath(parentPath, menu.path)
      const children = menu.children?.length
        ? buildMenuItems(menu.children, key)
        : undefined
      const Icon = menu.meta?.icon ? MENU_ICON_MAP[menu.meta.icon] : undefined

      return {
        key,
        label: menu.meta?.title ?? menu.name,
        icon: Icon ? createElement(Icon) : undefined,
        children: children?.length ? children : undefined
      }
    })
}

/**
 * Returns only the first level of a menu tree while keeping the original menu
 * metadata. Split navigation uses this shape for the top/first column menu;
 * the second column renders the selected menu's children separately.
 */
export function stripMenuChildren(menus: Menu[]): Menu[] {
  return menus.map((menu) => {
    const topLevelMenu = { ...menu }
    delete topLevelMenu.children
    return topLevelMenu
  })
}

export function collectMenuPaths(
  menus: Menu[],
  parentPath = '',
  ancestors: string[] = []
): MenuPathEntry[] {
  return menus
    .filter((menu) => menu.meta?.hidden !== true)
    .flatMap((menu) => {
      const key = joinMenuPath(parentPath, menu.path)
      const ownEntry = {
        key,
        ancestors,
        link: menu.meta?.link,
        iframe: menu.meta?.iframe
      }
      const children = menu.children?.length
        ? collectMenuPaths(menu.children, key, [...ancestors, key])
        : []
      return [ownEntry, ...children]
    })
}

export function matchCurrentMenu(
  pathname: string,
  entries: MenuPathEntry[]
): MenuPathEntry | undefined {
  return entries
    .filter(({ key }) => pathname === key || pathname.startsWith(`${key}/`))
    .sort((left, right) => right.key.length - left.key.length)[0]
}

export function findTopLevelMenu(
  pathname: string,
  menus: Menu[]
): Menu | undefined {
  return menus
    .map((menu) => ({
      menu,
      key: joinMenuPath('', menu.path)
    }))
    .filter(
      ({ key }) => pathname === key || pathname.startsWith(`${key}/`)
    )
    .sort((left, right) => right.key.length - left.key.length)[0]?.menu
}

export function findMenuByPath(
  menus: Menu[],
  targetPath: string,
  parentPath = ''
): Menu | undefined {
  for (const menu of menus) {
    const key = joinMenuPath(parentPath, menu.path)

    if (key === targetPath) {
      return menu
    }

    if (menu.children?.length) {
      const child = findMenuByPath(menu.children, targetPath, key)

      if (child) {
        return child
      }
    }
  }

  return undefined
}

export function findFirstLeafPath(
  menu: Menu,
  parentPath = ''
): string | undefined {
  if (menu.meta?.hidden === true || menu.meta?.link) {
    return undefined
  }

  const key = joinMenuPath(parentPath, menu.path)

  if (!menu.children?.length) {
    return key
  }

  for (const child of menu.children) {
    const leafPath = findFirstLeafPath(child, key)

    if (leafPath) {
      return leafPath
    }
  }

  return undefined
}

export function findFirstAccessiblePath(
  menus: Menu[],
  permissions: readonly string[],
  parentPath = ''
): string | undefined {
  const sortedMenus = [...menus].sort(
    (left, right) => (left.meta?.rank ?? 0) - (right.meta?.rank ?? 0)
  )

  for (const menu of sortedMenus) {
    const permission = menu.meta?.permission

    if (
      menu.meta?.hidden === true ||
      menu.meta?.link ||
      (permission && !permissions.includes(permission))
    ) {
      continue
    }

    const key = joinMenuPath(parentPath, menu.path)

    if (menu.children?.length) {
      const childPath = findFirstAccessiblePath(
        menu.children,
        permissions,
        key
      )

      if (childPath) {
        return childPath
      }

      continue
    }

    if (menu.component || menu.meta?.iframe) {
      return key
    }
  }

  return undefined
}

export function resolveMenuUrl(value?: string): string | undefined {
  if (!value) {
    return undefined
  }

  try {
    const url = new URL(value, window.location.origin)

    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.href
      : undefined
  } catch {
    return undefined
  }
}
