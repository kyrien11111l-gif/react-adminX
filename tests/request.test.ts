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
  window.localStorage.clear()
  vi.useRealTimers()
})

describe('request', () => {
  it('uses the current origin and serializes GET params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ code: 0, message: 'ok', data: { id: '1' } })
    )
    vi.stubGlobal('fetch', fetchMock)
    const { request } = await loadRequest()

    await request.get<{ id: string }>('/users', {
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
    expect(new Headers(init.headers).get('Content-Type')).toBe(
      'application/json'
    )
  })

  it('combines the configured proxy URL with POST data and params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ code: 0, message: 'ok', data: { id: '1' } })
    )
    vi.stubGlobal('fetch', fetchMock)
    const { request } = await loadRequest('https://proxy.example.test/api')

    await request.post<{ id: string }>('/users', {
      data: { name: '管理员' },
      params: { source: 'console' }
    })

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

  it('supports data and params for PUT, PATCH, and DELETE', async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(jsonResponse({ code: 0, message: 'ok', data: null }))
    )
    vi.stubGlobal('fetch', fetchMock)
    const { request } = await loadRequest()

    await request.put('/users/1', {
      data: { name: '管理员' },
      params: { notify: true }
    })
    await request.patch('/users/1', {
      data: { name: '新管理员' },
      params: { source: 'console' }
    })
    await request.delete('/users/1', {
      data: { reason: 'inactive' },
      params: { force: true }
    })

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'PUT',
      body: JSON.stringify({ name: '管理员' })
    })
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: 'PATCH',
      body: JSON.stringify({ name: '新管理员' })
    })
    expect(fetchMock.mock.calls[2][1]).toMatchObject({
      method: 'DELETE',
      body: JSON.stringify({ reason: 'inactive' })
    })

    expect((fetchMock.mock.calls[0][0] as URL).searchParams.get('notify')).toBe(
      'true'
    )
    expect(
      (fetchMock.mock.calls[1][0] as URL).searchParams.get('source')
    ).toBe('console')
    expect((fetchMock.mock.calls[2][0] as URL).searchParams.get('force')).toBe(
      'true'
    )
  })

  it('passes FormData through without JSON serialization', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ code: 0, message: 'ok', data: null })
    )
    vi.stubGlobal('fetch', fetchMock)
    const { request } = await loadRequest()
    const formData = new FormData()
    formData.append(
      'file',
      new File(['content'], 'avatar.txt', { type: 'text/plain' })
    )

    await request.post('/upload', { data: formData })

    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    expect(init.body).toBe(formData)
    expect(new Headers(init.headers).get('Content-Type')).toBeNull()
  })

  it('uses the File or Blob MIME type for a native file body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ code: 0, message: 'ok', data: null })
    )
    vi.stubGlobal('fetch', fetchMock)
    const { request } = await loadRequest()
    const file = new File(['content'], 'avatar.png', { type: 'image/png' })

    await request.post('/upload', { data: file })

    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    expect(init.body).toBe(file)
    expect(new Headers(init.headers).get('Content-Type')).toBe('image/png')
  })

  it('falls back to application/octet-stream for an untyped Blob', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ code: 0, message: 'ok', data: null })
    )
    vi.stubGlobal('fetch', fetchMock)
    const { request } = await loadRequest()
    const blob = new Blob(['content'])

    await request.post('/upload', { data: blob })

    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    expect(init.body).toBe(blob)
    expect(new Headers(init.headers).get('Content-Type')).toBe(
      'application/octet-stream'
    )
  })

  it('keeps an explicitly configured Content-Type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ code: 0, message: 'ok', data: null })
    )
    vi.stubGlobal('fetch', fetchMock)
    const { request } = await loadRequest()

    await request.post('/users', {
      data: { name: '管理员' },
      headers: { 'Content-Type': 'application/custom+json' }
    })

    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    expect(new Headers(init.headers).get('Content-Type')).toBe(
      'application/custom+json'
    )
  })

  it('always sends the stored token when it exists', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ code: 0, message: 'ok', data: { token: 'next-token' } })
    )
    vi.stubGlobal('fetch', fetchMock)
    const { request } = await loadRequest()
    const { useAuthStore } = await import('@/stores/auth')
    useAuthStore.getState().setToken('stored-token')

    await request.post('/login', {
      data: { username: 'admin', password: '123456' },
      headers: { Authorization: 'Bearer custom-token' }
    })

    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    expect(new Headers(init.headers).get('Authorization')).toBe(
      'Bearer stored-token'
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

    const pendingRequest = request.get('/slow', { timeout: 50 })
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
