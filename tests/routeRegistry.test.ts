import { describe, expect, it, vi } from 'vitest'
import {
  bindRouter,
  rematchDynamicLocation,
  registerDynamicRoutes
} from '@/router/dynamic/routeRegistry'

describe('registerDynamicRoutes', () => {
  it('patches dynamic routes onto the root anchor', () => {
    const router = {
      patchRoutes: vi.fn()
    }

    bindRouter(router as never)
    registerDynamicRoutes([{ path: 'dashboard' }])

    expect(router.patchRoutes).toHaveBeenCalledTimes(1)
    expect(router.patchRoutes).toHaveBeenCalledWith('root', [
      { path: 'dashboard' }
    ])
  })

  it('rematches the target location directly after route patching', async () => {
    const router = {
      navigate: vi.fn().mockResolvedValue(undefined)
    }

    bindRouter(router as never)
    await rematchDynamicLocation('/system/users?tab=all#table')

    expect(router.navigate).toHaveBeenCalledTimes(1)
    expect(router.navigate).toHaveBeenCalledWith(
      '/system/users?tab=all#table',
      { replace: true }
    )
  })
})
