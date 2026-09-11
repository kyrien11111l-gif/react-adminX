import { create } from 'zustand'
import { getMenus, getPermissions, getUserInfo } from '@/api'
import { generateRoutes } from '@/router/dynamic'
import { registerDynamicRoutes } from '@/router/dynamic/routeRegistry'
import { getDynamicMenus, withDashboardMenu } from '@/router/config/baseRoutes'
import type { Menu } from '@/types'
import { useUserStore } from '@/stores/user'
import { showStartupLoading } from '@/utils/startupLoading'

interface PermissionState {
  initialized: boolean
  error: string | null
  menus: Menu[]
  permissions: string[]
  initialize: () => Promise<void>
  reset: () => void
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '权限初始化失败，请稍后重试'
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  initialized: false,
  error: null,
  menus: [],
  permissions: [],

  initialize: async () => {
    if (get().initialized) {
      return
    }
    showStartupLoading()
    set({ error: null })

    try {
      const [user, fetchedMenus, permissions] = await Promise.all([
        getUserInfo(),
        getMenus(),
        getPermissions()
      ])

      useUserStore.getState().setUser(user)

      const menus = withDashboardMenu(fetchedMenus)
      const dynamicMenus = getDynamicMenus(menus)
      const routes = generateRoutes(dynamicMenus)

      registerDynamicRoutes(routes)

      set({
        initialized: true,
        error: null,
        menus,
        permissions
      })
    } catch (error) {
      set({
        initialized: false,
        error: getErrorMessage(error)
      })
      throw error
    }
  },

  reset: () => {
    set({
      initialized: false,
      error: null,
      menus: [],
      permissions: []
    })
  }
}))
