import type { Menu } from '@/types/menu'

export interface PermissionSnapshot {
  menus: Menu[]
  permissions: string[]
}
