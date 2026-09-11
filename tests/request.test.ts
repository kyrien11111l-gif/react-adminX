import { afterEach, describe, expect, it, vi } from 'vitest'

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

async function loadRequest(proxyUrl = '') {
  vi.resetModules()
  vi.stubEnv('VITE_API_PROXY_URL', proxyUrl)
  vi.stubEnv('VITE_USE_MOCK', 'false')
  return import('@/services/request')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('request', () => {
  it('uses the current origin and only serializes GET params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ code: 0, message: 'ok', data: { id: '1' } })
    )
    vi.stubGlobal('fetch', fetchMock)
    const { request } = await loadRequest()

    await request.get<{ id: string }>('/users', {
      auth: false,
      params: {
        page: 2,
        enabled: true,
        roles: ['admin', 'editor'],
        ignored: null
      }
    })

    const [input, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    expect(input.origin).toBe(window.location.origin)
    expect(input.pathname).toBe('/users')
    expect(input.searchParams.getAll('roles')).toEqual(['admin', 'editor'])
    expect(input.searchParams.get('page')).toBe('2')
    expect(input.searchParams.get('enabled')).toBe('true')
    expect(input.searchParams.has('ignored')).toBe(false)
    expect(init.method).toBe('GET')
    expect(init.body).toBeUndefined()
  })

  it('combines the configured proxy URL with POST data and params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ code: 0, message: 'ok', data: { id: '1' } })
    )
    vi.stubGlobal('fetch', fetchMock)
    const { request } = await loadRequest('https://proxy.example.test/api')

    await request.post<{ id: string }>(
      '/users',
      { name: '管理员' },
      { auth: false, params: { source: 'console' } }
    )

    const [input, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    expect(input.toString()).toBe(
      'https://proxy.example.test/api/users?source=console'
    )
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ name: '管理员' }))
    expect(new Headers(init.headers).get('Content-Type')).toBe(
      'application/json'
    )
  })

  it('cancels requests after the configured timeout', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), {
            once: true
          })
        })
    )
    vi.stubGlobal('fetch', fetchMock)
    const { isRequestError, request } = await loadRequest()

    const pendingRequest = request.get('/slow', { auth: false, timeout: 50 })
    const requestError = pendingRequest.then(
      () => null,
      (error: unknown) => error
    )
    await vi.advanceTimersByTimeAsync(50)

    const error = await requestError
    expect(error).toMatchObject({ code: 'TIMEOUT' })
    expect(isRequestError(error)).toBe(true)
  })

  it('uses a canceled error when the caller aborts the request', async () => {
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), {
            once: true
          })
        })
    )
    vi.stubGlobal('fetch', fetchMock)
    const { request } = await loadRequest()
    const controller = new AbortController()

    const pendingRequest = request.get('/cancel', {
      auth: false,
      signal: controller.signal
    })
    const requestError = pendingRequest.then(
      () => null,
      (error: unknown) => error
    )
    controller.abort()

    await expect(requestError).resolves.toMatchObject({ code: 'CANCELED' })
  })
})
