import { usePermissionStore } from '@/stores/permission'

export function hasPermission(code?: string): boolean {
  if (!code) {
    return true
  }
  return usePermissionStore.getState().permissions.includes(code)
}
