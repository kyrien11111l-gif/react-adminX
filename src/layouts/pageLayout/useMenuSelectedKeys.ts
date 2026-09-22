import { useMemo } from 'react'
import type { MenuPathEntry } from '@/types'

/**
 * The selected item is the current route; ancestor menus are controlled by
 * openKeys.
 */
export function useMenuSelectedKeys(currentMenu?: MenuPathEntry) {
  return useMemo(
    () => (currentMenu ? [currentMenu.key] : []),
    [currentMenu]
  )
}
