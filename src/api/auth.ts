import { request } from '@/services'
import type { LoginCredentials, LoginResult } from '@/types'

export function login(credentials: LoginCredentials): Promise<LoginResult> {
  return request.post<LoginResult>('/login', { data: credentials })
}
