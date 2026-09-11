import { request } from '@/services'
import type { UserInfo } from '@/types'

export function getUserInfo(signal?: AbortSignal): Promise<UserInfo> {
  return request.get<UserInfo>('/user/info', { signal })
}

export function getPermissions(signal?: AbortSignal): Promise<string[]> {
  return request.get<string[]>('/permissions', { signal })
}
