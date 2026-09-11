import {
  useAuthStore,
  usePermissionStore,
  useTabsStore,
  useUserStore
} from '@/stores'
import type { NavigateFunction } from 'react-router-dom'
import { LOGIN_PATH } from '@/router/config/constants'
import { showStartupLoading } from '@/utils/startupLoading'

export function resetSession() {
  useAuthStore.getState().clearToken()
  useUserStore.getState().reset()
  usePermissionStore.getState().reset()
  useTabsStore.getState().reset()
}

export function logoutToLogin(navigate: NavigateFunction) {
  showStartupLoading()
  resetSession()
  void navigate(LOGIN_PATH, { replace: true })
}
