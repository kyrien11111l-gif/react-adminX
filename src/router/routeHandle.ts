import type { AppRouteHandle } from '@/types'

export function isAppRouteHandle(value: unknown): value is AppRouteHandle {
  return typeof value === 'object' && value !== null
}
