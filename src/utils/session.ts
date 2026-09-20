import {
  useAuthStore,
  usePermissionStore,
  useTabsStore,
  useUserStore
} from '@/stores'
import type { NavigateFunction } from 'react-router-dom'
import { createLoginUrl } from '@/utils/navigation'
import { showStartupLoading } from '@/utils/startupLoading'

export function resetSession() {
  useAuthStore.getState().clearToken()
  useUserStore.getState().reset()
  usePermissionStore.getState().reset()
  useTabsStore.getState().reset()
}

export function logoutToLogin(navigate: NavigateFunction, target: string) {
  showStartupLoading()
  resetSession()
  void navigate(createLoginUrl(target), { replace: true })
}
