import { describe, expect, it } from 'vitest'
import { handleMockMenus } from '@/mocks/menu'
import { handleMockPermissions } from '@/mocks/user'
import { hasRouteComponent } from '@/router/dynamic/componentLoader'
import type { ApiResponse, Menu } from '@/types'

describe('TanStack page registration', () => {
  it('registers the page with a matching permission and component', async () => {
    const menuResponse = await handleMockMenus().json() as ApiResponse<Menu[]>
    const permissionResponse = await handleMockPermissions().json() as ApiResponse<string[]>
    const system = menuResponse.data.find((menu) => menu.path === 'system')
    const page = system?.children?.find((menu) => menu.path === 'tanstack')

    expect(page?.component).toBe('system/tanstack/index')
    expect(page?.meta?.permission).toBe('system:tanstack:list')
    expect(permissionResponse.data).toContain(page?.meta?.permission)
    expect(hasRouteComponent(page?.component ?? '')).toBe(true)
  })
})
