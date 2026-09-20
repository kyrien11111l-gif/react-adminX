import { getMenus, getPermissions, getUserInfo } from '@/api'
import { usePermissionStore } from '@/stores/permission'
import { useTabsStore } from '@/stores/tabs'
import { useUserStore } from '@/stores/user'
import type { PermissionSnapshot } from '@/types/permission'
import {
  findFirstAccessiblePath,
  findMenuByPath
} from '@/utils/menu'

let activeInitialization: Promise<PermissionSnapshot> | null = null

function getCurrentSnapshot(): PermissionSnapshot {
  const { menus, permissions, homePath } = usePermissionStore.getState()

  return { menus, permissions, homePath }
}

/**
 * Loads the server-backed session data once per application initialization.
 * Store data is written before AuthGuard prepares dynamic routes.
 */
export function initializeSession(): Promise<PermissionSnapshot> {
  const permissionState = usePermissionStore.getState()

  if (permissionState.initialized) {
    return Promise.resolve(getCurrentSnapshot())
  }

  if (activeInitialization) {
    return activeInitialization
  }

  const initialization = (async () => {
    try {
      const [user, fetchedMenus, permissions] = await Promise.all([
        getUserInfo(),
        getMenus(),
        getPermissions()
      ])

      const homePath = findFirstAccessiblePath(fetchedMenus, permissions) ?? null
      const snapshot: PermissionSnapshot = {
        menus: fetchedMenus,
        permissions,
        homePath
      }
      const homeMenu = homePath
        ? findMenuByPath(fetchedMenus, homePath)
        : undefined

      useUserStore.getState().setUser(user)
      usePermissionStore.getState().setData(snapshot)
      useTabsStore.getState().setHomeTab(
        homePath
          ? {
              key: homePath,
              title:
                homeMenu?.meta?.title ??
                homeMenu?.name ??
                homePath,
              closable: false
            }
          : null
      )

      return snapshot
    } finally {
      activeInitialization = null
    }
  })()

  activeInitialization = initialization

  return initialization
}
