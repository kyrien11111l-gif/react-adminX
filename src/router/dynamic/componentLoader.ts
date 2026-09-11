import { lazy, type ComponentType } from 'react'
import type { RouteObject } from 'react-router-dom'

interface RoutePageModule {
  default: ComponentType
}

const pageModules = import.meta.glob<RoutePageModule>('/src/pages/**/*.tsx')
type RouteComponent = NonNullable<RouteObject['Component']>
const lazyComponents = new Map<string, RouteComponent>()

export const ComponentNotFoundPage = lazy(
  () => import('@/pages/error/notMatch')
)

function getComponentModule(component: string) {
  return pageModules[`/src/pages/${component}.tsx`]
}

export function hasRouteComponent(component: string): boolean {
  return Boolean(getComponentModule(component))
}

export function loadComponent(
  component: string
): RouteComponent {
  const cachedComponent = lazyComponents.get(component)

  if (cachedComponent) {
    return cachedComponent
  }

  const loadModule = getComponentModule(component)

  if (!loadModule) {
    lazyComponents.set(component, ComponentNotFoundPage)
    return ComponentNotFoundPage
  }

  const LazyComponent = lazy(() => loadModule())

  lazyComponents.set(component, LazyComponent)

  return LazyComponent
}
