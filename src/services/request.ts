import { mockFetch } from '@/mocks'
import { useAuthStore } from '@/stores/auth'
import type {
  RequestConfig,
  RequestParamValue,
  RequestParams
} from '@/services/types'
import type { ApiResponse } from '@/types'
import { handleUnauthorizedOnce } from '@/services/unauthorized'

const API_PROXY_URL = import.meta.env.VITE_API_PROXY_URL?.trim()
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const DEFAULT_REQUEST_TIMEOUT = 30_000

export interface RequestError extends Error {
  status?: number
  code?: number | string
}

interface RequestErrorOptions {
  status?: number
  code?: number | string
}

interface AbortContext {
  signal: AbortSignal
  hasTimedOut: () => boolean
  cleanup: () => void
}

function createRequestError(
  message: string,
  options: RequestErrorOptions = {}
): RequestError {
  const error = new Error(message) as RequestError
  error.name = 'RequestError'
  error.status = options.status
  error.code = options.code
  return error
}

export function isRequestError(error: unknown): error is RequestError {
  return error instanceof Error && error.name === 'RequestError'
}

function isAbsoluteUrl(url: string): boolean {
  return /^[a-z][a-z\d+.-]*:/i.test(url)
}

function createUrl(path: string): URL {
  if (isAbsoluteUrl(path)) {
    return new URL(path)
  }

  if (!API_PROXY_URL) {
    return new URL(path, window.location.origin)
  }

  const normalizedBaseUrl = API_PROXY_URL.replace(/\/+$/, '')
  const normalizedPath = path.replace(/^\/+/, '')
  return new URL(`${normalizedBaseUrl}/${normalizedPath}`, window.location.origin)
}

function appendParam(url: URL, key: string, value: RequestParamValue) {
  if (value !== undefined && value !== null) {
    url.searchParams.append(key, String(value))
  }
}

function isParamValueArray(
  value: RequestParamValue | readonly RequestParamValue[]
): value is readonly RequestParamValue[] {
  return Array.isArray(value)
}

function appendParams(url: URL, params?: RequestParams) {
  if (!params) {
    return
  }

  Object.entries(params).forEach(([key, value]) => {
    if (isParamValueArray(value)) {
      value.forEach((item) => appendParam(url, key, item))
      return
    }

    appendParam(url, key, value)
  })
}

function isNativeBody(body: unknown): body is BodyInit {
  return (
    typeof body === 'string' ||
    (typeof Blob !== 'undefined' && body instanceof Blob) ||
    (typeof FormData !== 'undefined' && body instanceof FormData) ||
    (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) ||
    (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) ||
    (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(body)) ||
    (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream)
  )
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'data' in value
  )
}

function createAbortContext(
  externalSignal: AbortSignal | undefined,
  timeout: number
): AbortContext {
  const controller = new AbortController()
  let hasTimedOut = false
  let timeoutId: number | undefined

  const abortFromExternalSignal = () => {
    controller.abort(externalSignal?.reason)
  }

  if (externalSignal) {
    if (externalSignal.aborted) {
      abortFromExternalSignal()
    } else {
      externalSignal.addEventListener('abort', abortFromExternalSignal, {
        once: true
      })
    }
  }

  if (timeout > 0 && !controller.signal.aborted) {
    timeoutId = window.setTimeout(() => {
      hasTimedOut = true
      controller.abort(new DOMException('请求超时', 'TimeoutError'))
    }, timeout)
  }

  return {
    signal: controller.signal,
    hasTimedOut: () => hasTimedOut,
    cleanup: () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
      externalSignal?.removeEventListener('abort', abortFromExternalSignal)
    }
  }
}

async function readJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    if (response.status === 204) {
      return undefined
    }
    throw createRequestError('服务器返回了无法解析的响应', {
      status: response.status
    })
  }

  return response.json() as Promise<unknown>
}

function createBody(
  data: unknown,
  headers: Headers
): BodyInit | undefined {
  if (data === undefined) {
    return undefined
  }

  if (isNativeBody(data)) {
    return data
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return JSON.stringify(data)
}

async function request<T>(
  path: string,
  method: string,
  data: unknown,
  config: RequestConfig = {}
): Promise<T> {
  const {
    auth = true,
    headers: customHeaders,
    params,
    signal: externalSignal,
    timeout = DEFAULT_REQUEST_TIMEOUT,
    ...requestInit
  } = config

  if (!Number.isFinite(timeout) || timeout < 0) {
    throw createRequestError('请求超时时间必须是大于或等于 0 的有限数字')
  }

  const url = createUrl(path)
  appendParams(url, params)

  const headers = new Headers(customHeaders)
  headers.set('Accept', 'application/json')

  if (auth) {
    const token = useAuthStore.getState().token
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const abortContext = createAbortContext(externalSignal, timeout)
  const fetcher = USE_MOCK ? mockFetch : fetch
  let response: Response
  let payload: unknown

  try {
    response = await fetcher(url, {
      ...requestInit,
      method,
      body: createBody(data, headers),
      headers,
      signal: abortContext.signal
    })
    payload = await readJson(response)
  } catch (error) {
    if (abortContext.hasTimedOut()) {
      throw createRequestError('请求超时，请稍后重试', { code: 'TIMEOUT' })
    }
    if (abortContext.signal.aborted) {
      throw createRequestError('请求已取消', { code: 'CANCELED' })
    }
    throw error
  } finally {
    abortContext.cleanup()
  }

  if (response.status === 401) {
    await handleUnauthorizedOnce()
    throw createRequestError('登录状态已失效', {
      status: 401,
      code: 'UNAUTHORIZED'
    })
  }

  if (!response.ok) {
    const message = isApiResponse(payload)
      ? payload.message
      : `请求失败（${response.status}）`
    throw createRequestError(message, {
      status: response.status,
      code: isApiResponse(payload) ? payload.code : undefined
    })
  }

  if (isApiResponse(payload)) {
    if (payload.code !== 0 && payload.code !== '0') {
      throw createRequestError(payload.message, {
        status: response.status,
        code: payload.code
      })
    }
    return payload.data as T
  }

  return payload as T
}

export function get<T>(path: string, config?: RequestConfig): Promise<T> {
  return request<T>(path, 'GET', undefined, config)
}

export function post<T, TData = unknown>(
  path: string,
  data?: TData,
  config?: RequestConfig
): Promise<T> {
  return request<T>(path, 'POST', data, config)
}

export function put<T, TData = unknown>(
  path: string,
  data?: TData,
  config?: RequestConfig
): Promise<T> {
  return request<T>(path, 'PUT', data, config)
}

export function patch<T, TData = unknown>(
  path: string,
  data?: TData,
  config?: RequestConfig
): Promise<T> {
  return request<T>(path, 'PATCH', data, config)
}

export function remove<T>(path: string, config?: RequestConfig): Promise<T> {
  return request<T>(path, 'DELETE', undefined, config)
}

const requestClient = {
  get,
  post,
  put,
  patch,
  delete: remove
}

export { requestClient as request }
