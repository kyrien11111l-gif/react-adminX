import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/layouts'
import { RouteErrorPage } from '@/pages/error/routeError'
import { ROOT_ROUTE_ID } from '@/router/config/constants'
import { startRouteProgress } from '@/router/routeProgress'
import { bindRouter } from '@/router/dynamic/routeRegistry'
import { baseRoutes } from '@/router/config/baseRoutes'

export const router = createBrowserRouter([
  {
    id: ROOT_ROUTE_ID,
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RouteErrorPage,
    loader: () => {
      startRouteProgress()
      return null
    },
    shouldRevalidate: ({ currentUrl, nextUrl }) => {
      const isSameLocation =
        currentUrl.pathname === nextUrl.pathname &&
        currentUrl.search === nextUrl.search &&
        currentUrl.hash === nextUrl.hash

      if (!isSameLocation) {
        startRouteProgress()
      }

      return false
    },
    children: baseRoutes
  }
])

bindRouter(router)

export { ROOT_ROUTE_ID } from '@/router/config/constants'
