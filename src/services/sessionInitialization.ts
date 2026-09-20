import { getMenus, getPermissions, getUserInfo } from '@/api'
import { withDashboardMenu } from '@/router/config/menu'
import { usePermissionStore } from '@/stores/permission'
import { useUserStore } from '@/stores/user'
import type { PermissionSnapshot } from '@/types/permission'

let activeInitialization: Promise<PermissionSnapshot> | null = null
let activeController: AbortController | null = null
let sessionGeneration = 0

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '权限初始化失败，请稍后重试'
}

function getCurrentSnapshot(): PermissionSnapshot {
  const { menus, permissions } = usePermissionStore.getState()

  return { menus, permissions }
}

/**
 * Loads the server-backed session data once per session generation.
 * Stores own state only; route registration is coordinated by AuthGuard.
 */
export function initializeSession(): Promise<PermissionSnapshot> {
  const permissionState = usePermissionStore.getState()

  if (permissionState.initialized) {
    return Promise.resolve(getCurrentSnapshot())
  }

  if (activeInitialization) {
    return activeInitialization
  }

  const generation = sessionGeneration
  const controller = new AbortController()

  activeController = controller
  const initialization = (async () => {
    try {
      const [user, fetchedMenus, permissions] = await Promise.all([
        getUserInfo(controller.signal),
        getMenus(controller.signal),
        getPermissions(controller.signal)
      ])

      const snapshot: PermissionSnapshot = {
        menus: withDashboardMenu(fetchedMenus),
        permissions
      }

      if (generation !== sessionGeneration) {
        return snapshot
      }

      useUserStore.getState().setUser(user)
      usePermissionStore.getState().setData(snapshot)

      return snapshot
    } catch (error) {
      if (generation === sessionGeneration) {
        usePermissionStore.getState().setError(getErrorMessage(error))
      }

      throw error
    } finally {
      if (activeController === controller) {
        activeInitialization = null
        activeController = null
      }
    }
  })()

  activeInitialization = initialization

  return initialization
}

/**
 * Invalidates and aborts the current load before clearing session stores.
 * A late response from the previous session cannot repopulate the stores.
 */
export function invalidateSessionInitialization() {
  sessionGeneration += 1
  activeController?.abort()
  activeInitialization = null
  activeController = null
}
