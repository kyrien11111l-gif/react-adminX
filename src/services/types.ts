export type RequestParamValue = string | number | boolean | null | undefined

export type RequestParams = Record<
  string,
  RequestParamValue | readonly RequestParamValue[]
>

export interface RequestConfig extends Omit<
  RequestInit,
  'body' | 'method' | 'signal'
> {
  auth?: boolean
  params?: RequestParams
  signal?: AbortSignal
  timeout?: number
}
