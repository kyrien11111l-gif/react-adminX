import { getDynamicMenus } from '@/router/config/menu'
import { generateRoutes } from '@/router/dynamic/generateRoutes'
import { registerDynamicRoutes } from '@/router/dynamic/routeRegistry'
import type { Menu } from '@/types/menu'

/**
 * Converts the server menu snapshot into routes and registers them as one
 * routing operation. This module deliberately has no store dependency.
 */
export function registerDynamicMenuRoutes(menus: Menu[]) {
  const routes = generateRoutes(getDynamicMenus(menus))

  registerDynamicRoutes(routes)
}
