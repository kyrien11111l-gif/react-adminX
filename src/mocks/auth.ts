import type { ApiResponse, LoginCredentials, LoginResult } from '@/types'

export function handleMockLogin(credentials: LoginCredentials): Response {
  if (credentials.username !== 'admin' || credentials.password !== '123456') {
    return jsonResponse<ApiResponse<null>>(
      {
        code: 'AUTH_INVALID_CREDENTIALS',
        message: '用户名或密码错误',
        data: null
      },
      400
    )
  }

  return jsonResponse<ApiResponse<LoginResult>>({
    code: 0,
    message: '登录成功',
    data: { token: 'mock-token' }
  })
}

export function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
