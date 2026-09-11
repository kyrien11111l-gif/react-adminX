import type { LoginCredentials } from '@/types'
import { handleMockLogin, jsonResponse } from '@/mocks/auth'
import { handleMockMenus } from '@/mocks/menu'
import { handleMockQuery } from '@/mocks/query'
import { handleMockPermissions, handleMockUserInfo } from '@/mocks/user'
import type { QueryFilters } from '@/pages/system/query/data'

const MOCK_LATENCY = 240

function getPath(input: RequestInfo | URL): string {
  const rawUrl =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url

  const pathname = new URL(rawUrl, window.location.origin).pathname
  return pathname.replace(/^\/api(?=\/|$)/, '') || '/'
}

function parseJsonBody<T>(body: BodyInit | null | undefined): T | null {
  if (typeof body !== 'string') {
    return null
  }

  try {
    return JSON.parse(body) as T
  } catch {
    return null
  }
}

function delay(signal?: AbortSignal | null): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
      return
    }

    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, MOCK_LATENCY)

    function onAbort() {
      window.clearTimeout(timeoutId)
      reject(signal?.reason ?? new DOMException('Aborted', 'AbortError'))
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export async function mockFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  await delay(init?.signal)

  const path = getPath(input)
  const method = (init?.method ?? 'GET').toUpperCase()

  if (path === '/login' && method === 'POST') {
    const credentials = parseJsonBody<LoginCredentials>(init?.body)
    return credentials
      ? handleMockLogin(credentials)
      : jsonResponse(
          { code: 'BAD_REQUEST', message: '请求参数错误', data: null },
          400
        )
  }

  const authorization = new Headers(init?.headers).get('Authorization')
  if (authorization !== 'Bearer mock-token') {
    return jsonResponse(
      { code: 'UNAUTHORIZED', message: '登录状态已失效', data: null },
      401
    )
  }

  if (path === '/user/info' && method === 'GET') {
    return handleMockUserInfo()
  }
  if (path === '/menus' && method === 'GET') {
    return handleMockMenus()
  }
  if (path === '/permissions' && method === 'GET') {
    return handleMockPermissions()
  }
  if (path === '/query' && method === 'POST') {
    return handleMockQuery(parseJsonBody<QueryFilters>(init?.body))
  }

  return jsonResponse(
    {
      code: 'NOT_FOUND',
      message: `Mock endpoint not found: ${method} ${path}`,
      data: null
    },
    404
  )
}
