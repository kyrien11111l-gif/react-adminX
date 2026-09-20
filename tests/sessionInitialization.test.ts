import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({
  getMenus: vi.fn(),
  getPermissions: vi.fn(),
  getUserInfo: vi.fn()
}))

vi.mock('@/api', () => apiMocks)

import {
  initializeSession,
  invalidateSessionInitialization
} from '@/services/sessionInitialization'
import {
  usePermissionStore,
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

function createDeferred<T>() {
  let resolve!: (value: T) => void

  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve
  })

  return { promise, resolve }
}

describe('initializeSession', () => {
  beforeEach(() => {
    invalidateSessionInitialization()
    usePermissionStore.getState().reset()
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
      initialized: true,
      permissions: ['system:user:list']
    })
    expect(useUserStore.getState().user).toEqual(user)
  })

  it('does not commit a response after the session is invalidated', async () => {
    const userRequest = createDeferred<typeof user>()
    const menusRequest = createDeferred<typeof menus>()
    const permissionsRequest = createDeferred<string[]>()
    apiMocks.getUserInfo.mockReturnValue(userRequest.promise)
    apiMocks.getMenus.mockReturnValue(menusRequest.promise)
    apiMocks.getPermissions.mockReturnValue(permissionsRequest.promise)

    const initialization = initializeSession()
    invalidateSessionInitialization()
    userRequest.resolve(user)
    menusRequest.resolve(menus)
    permissionsRequest.resolve(['system:user:list'])

    await initialization

    expect(usePermissionStore.getState()).toMatchObject({
      initialized: false,
      menus: [],
      permissions: []
    })
    expect(useUserStore.getState().user).toBeNull()
  })
})
