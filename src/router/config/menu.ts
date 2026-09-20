import type { Menu } from '@/types/menu'

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
