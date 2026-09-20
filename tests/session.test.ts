import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useAuthStore,
  usePermissionStore,
  useTabsStore,
  useUserStore
} from '@/stores'
import { logoutToLogin, resetSession } from '@/utils/session'

describe('resetSession', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ token: null })
    useUserStore.getState().reset()
    usePermissionStore.getState().reset()
    useTabsStore.getState().reset()
  })

  it('clears auth, user, permission and tab state together', () => {
    useAuthStore.getState().setToken('token')
    useUserStore.getState().setUser({
      id: '1',
      username: 'admin',
      nickname: '管理员',
      roles: ['admin']
    })
    usePermissionStore.setState({
      initialized: true,
      homePath: '/dashboard',
      menus: [
        {
          id: 'dashboard',
          name: '工作台',
          path: 'dashboard',
          component: 'dashboard/index'
        }
      ],
      permissions: ['system:user:list']
    })
    useTabsStore.getState().addTab({
      key: '/system/user',
      title: '用户管理',
      closable: true
    })

    resetSession()

    expect(useAuthStore.getState().token).toBeNull()
    expect(useUserStore.getState().user).toBeNull()
    expect(usePermissionStore.getState()).toMatchObject({
      initialized: false,
      menus: [],
      permissions: []
    })
    expect(useTabsStore.getState().tabs).toHaveLength(0)
  })

  it('keeps the current page in the visible login URL when logging out', () => {
    const navigate = vi.fn()

    logoutToLogin(navigate, '/system/query?tab=1#top')

    expect(navigate).toHaveBeenCalledWith(
      '/login?redirect=/system/query%3Ftab%3D1%23top',
      { replace: true }
    )
  })
})
