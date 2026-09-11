import type { ApiResponse, Menu } from '@/types'
import { jsonResponse } from '@/mocks/auth'

const mockMenus: Menu[] = [
  {
    id: 'system',
    name: '系统管理',
    path: 'system',
    meta: {
      title: '系统管理',
      icon: 'SettingOutlined',
      rank: 2
    },
    children: [
      {
        id: 'system-user',
        name: '用户管理',
        path: 'user',
        component: 'system/user/index',
        meta: {
          title: '用户管理',
          icon: 'UserOutlined',
          permission: 'system:user:list',
          layout: 'default'
        }
      },
      {
        id: 'system-role',
        name: '角色管理',
        path: 'role',
        component: 'system/role/index',
        meta: {
          title: '角色管理',
          icon: 'SafetyCertificateOutlined',
          permission: 'system:role:list',
          layout: 'default'
        }
      },
      {
        id: 'system-query',
        name: '数据查询',
        path: 'query',
        component: 'system/query/index',
        meta: {
          title: '数据查询',
          icon: 'SearchOutlined',
          permission: 'system:query:list',
          layout: 'default'
        }
      },
      {
        id: 'system-audit',
        name: '审计记录',
        path: 'audit',
        component: 'system/audit/index',
        meta: {
          title: '审计记录',
          permission: 'system:audit:list',
          hidden: true,
          layout: 'default'
        }
      }
    ]
  },
  {
    id: 'fullscreen',
    name: '全屏页面',
    path: 'fullscreen',
    component: 'fullscreen/index',
    meta: {
      title: '全屏页面',
      icon: 'ExpandOutlined',
      layout: 'fullpage',
      rank: 3
    }
  },
  {
    id: 'parent',
    name: '多层管理',
    path: 'parent',
    meta: {
      title: '多层管理',
      icon: 'SettingOutlined'
    },
    children: [
      {
        id: 'chilren',
        name: '第二层',
        path: 'chilren',
        meta: {
          title: '第二层',
          icon: 'SettingOutlined'
        },
        children: [
          {
            id: 'son',
            name: '第三层',
            path: 'son',
            component: 'system/user/index',
            meta: {
              title: '第三层',
              permission: 'system:user:list'
            }
          }
        ]
      }
    ]
  }
]

export function handleMockMenus(): Response {
  return jsonResponse<ApiResponse<Menu[]>>({
    code: 0,
    message: 'success',
    data: mockMenus
  })
}
