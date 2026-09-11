import type { RouteObject } from 'react-router-dom'
import { Iframe } from '@/components'
import { PageLayout } from '@/layouts'
import {
  ComponentNotFoundPage,
  hasRouteComponent,
  loadComponent
} from '@/router/dynamic/componentLoader'
import type { Menu } from '@/types'

function sortMenus(menus: Menu[]): Menu[] {
  return [...menus].sort(
    (left, right) => (left.meta?.rank ?? 0) - (right.meta?.rank ?? 0)
  )
}

type RouteGroups = {
  defaultRoutes: RouteObject[]
  fullpageRoutes: RouteObject[]
}

function createRoute(menu: Menu, fullpage = false) {
  return {
    id: fullpage ? `${menu.id}--fullpage` : menu.id,
    path: menu.path,
    handle: menu.meta
  } satisfies RouteObject
}

function getLeafComponent(menu: Menu) {
  if (menu.meta?.iframe) {
    return Iframe
  }

  if (!menu.component || !hasRouteComponent(menu.component)) {
    return ComponentNotFoundPage
  }

  return loadComponent(menu.component)
}

function generateMenuRoutes(menu: Menu, depth = 0): RouteGroups {
  if (menu.meta?.link) {
    return { defaultRoutes: [], fullpageRoutes: [] }
  }

  if (!menu.children?.length) {
    const Component = getLeafComponent(menu)

    if (menu.meta?.layout === 'fullpage') {
      return {
        defaultRoutes: [],
        fullpageRoutes: [{ ...createRoute(menu, true), Component }]
      }
    }

    if (depth === 0) {
      return {
        defaultRoutes: [
          {
            ...createRoute(menu),
            Component: PageLayout,
            children: [{ index: true, Component }]
          }
        ],
        fullpageRoutes: []
      }
    }

    return {
      defaultRoutes: [{ ...createRoute(menu), Component }],
      fullpageRoutes: []
    }
  }

  const childGroups = sortMenus(menu.children).map((child) =>
    generateMenuRoutes(child, depth + 1)
  )
  const defaultChildren = childGroups.flatMap((group) => group.defaultRoutes)
  const fullpageChildren = childGroups.flatMap((group) => group.fullpageRoutes)

  return {
    defaultRoutes: defaultChildren.length
      ? [
          {
            ...createRoute(menu),
            ...(depth === 0 ? { Component: PageLayout } : {}),
            children: defaultChildren
          }
        ]
      : [],
    fullpageRoutes: fullpageChildren.length
      ? [
          {
            ...createRoute(menu, true),
            children: fullpageChildren
          }
        ]
      : []
  }
}

export function generateRoutes(menus: Menu[]): RouteObject[] {
  const groups = sortMenus(menus).map((menu) => generateMenuRoutes(menu))

  return [
    ...groups.flatMap((group) => group.defaultRoutes),
    ...groups.flatMap((group) => group.fullpageRoutes)
  ]
}
