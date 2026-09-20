import type { createBrowserRouter, RouteObject } from 'react-router-dom'
import { ROOT_ROUTE_ID } from '@/router/config/constants'

type AppRouter = ReturnType<typeof createBrowserRouter>

let activeRouter: AppRouter | null = null

/**
 * Returns the browser router after it has been bound during application startup.
 */
function getRouter(): AppRouter {
  if (!activeRouter) {
    throw new Error('Router must be bound before dynamic routes are used.')
  }

  return activeRouter
}

/**
 * Stores the single browser router instance used to patch backend routes.
 */
export function bindRouter(router: AppRouter) {
  activeRouter = router
}

/**
 * Registers the latest backend routes below the root route anchor.
 */
export function registerDynamicRoutes(routes: RouteObject[]) {
  getRouter().patchRoutes(ROOT_ROUTE_ID, routes)
}

/**
 * Forces React Router to match the current URL again after route patching.
 */
export async function rematchDynamicLocation(target: string): Promise<void> {
  await getRouter().navigate(target, { replace: true })
}
