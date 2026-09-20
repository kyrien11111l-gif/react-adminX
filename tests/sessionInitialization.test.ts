import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({
  getMenus: vi.fn(),
  getPermissions: vi.fn(),
  getUserInfo: vi.fn()
}))

vi.mock('@/api', () => apiMocks)

import { initializeSession } from '@/services/sessionInitialization'
import {
  usePermissionStore,
  useTabsStore,
  useUserStore
} from '@/stores'

const user = {
  id: '1',
  username: 'admin',
  nickname: '管理员',
  roles: ['admin']
}

const menus = [
  {
    id: 'system-user',
    name: '用户管理',
    path: 'system/user',
    component: 'system/user/index'
  }
]

describe('initializeSession', () => {
  beforeEach(() => {
    usePermissionStore.getState().reset()
    useTabsStore.getState().reset()
    useUserStore.getState().reset()
    apiMocks.getMenus.mockReset()
    apiMocks.getPermissions.mockReset()
    apiMocks.getUserInfo.mockReset()
  })

  it('deduplicates concurrent initialization requests', async () => {
    apiMocks.getUserInfo.mockResolvedValue(user)
    apiMocks.getMenus.mockResolvedValue(menus)
    apiMocks.getPermissions.mockResolvedValue(['system:user:list'])

    const firstInitialization = initializeSession()
    const secondInitialization = initializeSession()

    expect(secondInitialization).toBe(firstInitialization)

    await firstInitialization

    expect(apiMocks.getUserInfo).toHaveBeenCalledTimes(1)
    expect(apiMocks.getMenus).toHaveBeenCalledTimes(1)
    expect(apiMocks.getPermissions).toHaveBeenCalledTimes(1)
    expect(usePermissionStore.getState()).toMatchObject({
      initialized: false,
      permissions: ['system:user:list'],
      homePath: '/system/user'
    })
    expect(useUserStore.getState().user).toEqual(user)

    usePermissionStore.getState().markInitialized()

    expect(usePermissionStore.getState().initialized).toBe(true)
  })
})
