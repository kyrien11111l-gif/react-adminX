import type { ReactNode } from 'react'
import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { finishRouteProgress } from '@/router/routeProgress'
import { hideStartupLoading } from '@/utils/startupLoading'

interface RouteReadyProps {
  children: ReactNode
}

export function RouteReady({ children }: RouteReadyProps) {
  const location = useLocation()

  useLayoutEffect(() => {
    hideStartupLoading()
    finishRouteProgress()
  }, [location.hash, location.pathname, location.search])

  return <>{children}</>
}
