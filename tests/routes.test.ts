import { describe, expect, it } from 'vitest'
import {
  DASHBOARD_MENU,
  baseRoutes,
  getDynamicMenus,
  withDashboardMenu
} from '@/router/config/baseRoutes'
import { HOME_PATH } from '@/constants'
import { getSafeRedirectTarget } from '@/utils/navigation'
import type { Menu } from '@/types'

const serverMenus: Menu[] = [
  {
    id: 'dashboard',
    name: '服务端工作台',
    path: 'dashboard',
    component: 'dashboard/index'
  },
  {
    id: 'system',
    name: '系统管理',
    path: 'system'
  }
]

describe('base routes', () => {
  it('normalizes a saved root redirect to the dashboard', () => {
    expect(getSafeRedirectTarget({ from: '/' }, HOME_PATH)).toBe(HOME_PATH)
    expect(getSafeRedirectTarget({ from: '/system/user' }, HOME_PATH)).toBe(
      '/system/user'
    )
  })

  it('keeps the dashboard as a static route', () => {
    expect(baseRoutes).toContainEqual(
      expect.objectContaining({
        id: DASHBOARD_MENU.id,
        path: DASHBOARD_MENU.path
      })
    )
  })

  it('places the dashboard first and excludes it from dynamic routes', () => {
    const menus = withDashboardMenu(serverMenus)

    expect(menus[0]).toBe(DASHBOARD_MENU)
    expect(menus).toHaveLength(2)
    expect(getDynamicMenus(menus)).toEqual([serverMenus[1]])
  })
})
