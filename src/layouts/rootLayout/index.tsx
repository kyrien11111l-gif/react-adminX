import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { RouteReady } from '@/layouts/rootLayout/routeReady'
import { AuthGuard } from '@/router/guards'

export function RootLayout() {
  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <RouteReady>
          <Outlet />
        </RouteReady>
      </Suspense>
    </AuthGuard>
  )
}
