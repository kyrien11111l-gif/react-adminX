import { request } from '@/services'
import type { Menu } from '@/types'

export function getMenus(signal?: AbortSignal): Promise<Menu[]> {
  return request.get<Menu[]>('/menus', { signal })
}
