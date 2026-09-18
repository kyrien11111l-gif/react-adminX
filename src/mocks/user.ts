import type { ApiResponse, UserInfo } from '@/types'
import { jsonResponse } from '@/mocks/auth'

const mockUser: UserInfo = {
  id: 1,
  username: 'admin',
  nickname: 'Administrator',
  roles: ['admin']
}

const mockPermissions = [
  'system:user:list',
  'system:role:list',
  'system:query:list',
  'system:virtual-query:list'
]

export function handleMockUserInfo(): Response {
  return jsonResponse<ApiResponse<UserInfo>>({
    code: 0,
    message: 'success',
    data: mockUser
  })
}

export function handleMockPermissions(): Response {
  return jsonResponse<ApiResponse<string[]>>({
    code: 0,
    message: 'success',
    data: mockPermissions
  })
}
