import { describe, expect, it } from 'vitest'
import type { Menu } from '@/types'
import {
  findFirstAccessiblePath,
  findFirstLeafPath,
  findMenuByPath,
  findTopLevelMenu,
  stripMenuChildren
} from '@/utils/menu'

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
        component: 'system/user/index'
      }
    ]
  },
  {
    id: 'dashboard',
    name: '工作台',
    path: 'dashboard',
    component: 'dashboard/index'
  }
]

describe('menu navigation helpers', () => {
  it('keeps only top-level menu metadata for split navigation', () => {
    expect(stripMenuChildren(menus)).toEqual([
      {
        id: 'system',
        name: '系统管理',
        path: 'system'
      },
      menus[1]
    ])
  })

  it('finds the active top-level menu from a nested path', () => {
    expect(findTopLevelMenu('/system/user', menus)?.id).toBe('system')
  })

  it('finds a menu and its first leaf path', () => {
    const systemMenu = findMenuByPath(menus, '/system')

    expect(systemMenu?.id).toBe('system')
    expect(systemMenu && findFirstLeafPath(systemMenu)).toBe('/system/user')
  })

  it('finds the first accessible page by menu order', () => {
    expect(
      findFirstAccessiblePath(
        [
          {
            id: 'restricted',
            name: '受限页面',
            path: 'restricted',
            component: 'restricted/index',
            meta: { permission: 'restricted:read', rank: 0 }
          },
          ...menus
        ],
        ['system:user:list']
      )
    ).toBe('/system/user')
  })

  it('skips hidden and external menus when resolving the home page', () => {
    expect(
      findFirstAccessiblePath([
        {
          id: 'hidden',
          name: '隐藏页面',
          path: 'hidden',
          component: 'hidden/index',
          meta: { hidden: true, rank: 0 }
        },
        {
          id: 'external',
          name: '外部页面',
          path: 'external',
          meta: { link: 'https://example.com', rank: 1 }
        },
        menus[1]
      ], [])
    ).toBe('/dashboard')
  })
})
