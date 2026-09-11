import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { PageLayout } from '@/layouts'
import { WHITE_LIST_TEST_ROUTE_PATH } from '@/router/config/constants'
import type { Menu } from '@/types'

const DashboardPage = lazy(() => import('@/pages/dashboard'))
const LoginPage = lazy(() => import('@/pages/login'))
const WhiteListPage = lazy(() => import('@/pages/whiteList'))
const ForbiddenPage = lazy(() => import('@/pages/error/403'))
const NotFoundPage = lazy(() => import('@/pages/error/404'))

export const DASHBOARD_MENU: Menu = {
  id: 'dashboard',
  name: 'Dashboard',
  path: 'dashboard',
  meta: {
    title: '工作台',
    icon: 'DashboardOutlined',
    layout: 'default',
    affix: true,
    rank: 0
  }
}

function isDashboardMenu(menu: Menu): boolean {
  return menu.id === DASHBOARD_MENU.id || menu.path === DASHBOARD_MENU.path
}

export function withDashboardMenu(menus: Menu[]): Menu[] {
  return [DASHBOARD_MENU, ...menus.filter((menu) => !isDashboardMenu(menu))]
}

export function getDynamicMenus(menus: Menu[]): Menu[] {
  return menus.filter((menu) => !isDashboardMenu(menu))
}

export const baseRoutes: RouteObject[] = [
  // {
  //   index: true,
  //   loader: () => redirect(HOME_PATH)
  // },
  {
    id: DASHBOARD_MENU.id,
    path: DASHBOARD_MENU.path,
    handle: DASHBOARD_MENU.meta,
    Component: PageLayout,
    children: [
      {
        index: true,
        Component: DashboardPage
      }
    ]
  },
  {
    path: '403',
    Component: PageLayout,
    handle: {
      title: '403'
    },
    children: [
      {
        index: true,
        Component: ForbiddenPage
      }
    ]
  },
  {
    path: 'login',
    Component: LoginPage
  },
  {
    path: WHITE_LIST_TEST_ROUTE_PATH,
    Component: WhiteListPage
  },
  {
    path: '*',
    Component: NotFoundPage
  }
]
