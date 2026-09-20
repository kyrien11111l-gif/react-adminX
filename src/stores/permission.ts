import { create } from 'zustand'
import type { PermissionSnapshot } from '@/types/permission'

interface PermissionState extends PermissionSnapshot {
  initialized: boolean
  error: string | null
  setData: (snapshot: PermissionSnapshot) => void
  markInitialized: () => void
  setError: (error: string | null) => void
  reset: () => void
}

export const usePermissionStore = create<PermissionState>((set) => ({
  initialized: false,
  error: null,
  menus: [],
  permissions: [],
  homePath: null,

  setData: ({ menus, permissions, homePath }) =>
    set({
      initialized: false,
      error: null,
      menus,
      permissions,
      homePath
    }),

  markInitialized: () =>
    set({
      initialized: true,
      error: null
    }),

  setError: (error) =>
    set({
      initialized: false,
      error
    }),

  reset: () =>
    set({
      initialized: false,
      error: null,
      menus: [],
      permissions: [],
      homePath: null
    })
}))
