import { beforeEach, describe, expect, it } from 'vitest'
import {
  useAuthStore,
  usePermissionStore,
  useTabsStore,
  useUserStore
} from '@/stores'
import { resetSession } from '@/utils/session'

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
    expect(useTabsStore.getState().tabs).toHaveLength(1)
  })
})
