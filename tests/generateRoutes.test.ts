import { describe, expect, it } from 'vitest'
import { Iframe } from '@/components'
import { PageLayout } from '@/layouts'
import {
  ComponentNotFoundPage,
  generateRoutes,
  loadComponent
} from '@/router/dynamic'
import type { Menu } from '@/types'

const menus: Menu[] = [
  {
    id: 'system',
    name: '系统管理',
    path: 'system',
    children: [
      {
        id: 'user',
        name: '用户管理',
        path: 'user',
        component: 'system/user/index',
        meta: { layout: 'default', rank: 2 }
      },
      {
        id: 'fullscreen',
        name: '全屏页面',
        path: 'fullscreen',
        component: 'fullscreen/index',
        meta: { layout: 'fullpage', rank: 1 }
      }
    ]
  }
]

describe('generateRoutes', () => {
  it('shares PageLayout for the top-level default branch', () => {
    const routes = generateRoutes(menus)
    const systemRoute = routes.find((route) => route.id === 'system')
    const userRoute = systemRoute?.children?.find((route) => route.id === 'user')
    const fullpageBranch = routes.find(
      (route) => route.id === 'system--fullpage'
    )
    const fullpageRoute = fullpageBranch?.children?.[0]

    expect(systemRoute?.path).toBe('system')
    expect(systemRoute?.Component).toBe(PageLayout)
    expect(userRoute?.path).toBe('user')
    expect(userRoute?.Component).toBeDefined()
    expect(userRoute?.lazy).toBeUndefined()
    expect(fullpageRoute?.path).toBe('fullscreen')
    expect(fullpageRoute?.Component).toBeDefined()
    expect(fullpageRoute?.lazy).toBeUndefined()
  })

  it('renders iframe menus inside the shared layout', () => {
    const routes = generateRoutes([
      {
        id: 'docs',
        name: '文档',
        path: 'docs',
        meta: { iframe: 'https://example.com' }
      }
    ])

    expect(routes[0].Component).toBe(PageLayout)
    expect(routes[0].children?.[0]).toMatchObject({ index: true })
    expect(routes[0].children?.[0]?.Component).toBe(Iframe)
  })

  it('does not create a route for external-link menus', () => {
    const routes = generateRoutes([
      {
        id: 'external',
        name: '外部文档',
        path: 'external',
        meta: { link: 'https://example.com' }
      }
    ])

    expect(routes).toEqual([])
  })

  it('uses the component-not-found page for missing route components', () => {
    const routes = generateRoutes([
      { id: 'missing', name: '缺少组件', path: 'missing' },
      {
        id: 'unknown',
        name: '未知组件',
        path: 'unknown',
        component: 'not-exists/index'
      }
    ])

    expect(routes[0].children?.[0]?.Component).toBe(ComponentNotFoundPage)
    expect(routes[1].children?.[0]?.Component).toBe(ComponentNotFoundPage)
  })

  it('returns the lazy component-not-found page when a module cannot be resolved', () => {
    expect(loadComponent('not-exists/index')).toBe(ComponentNotFoundPage)
  })
})
