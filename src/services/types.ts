export type RequestParamValue = string | number | boolean | null | undefined

export type RequestParams = Record<
  string,
  RequestParamValue | readonly RequestParamValue[]
>

export interface RequestConfig<TData = unknown> extends Omit<
  RequestInit,
  'body' | 'method' | 'signal'
> {
  data?: TData
  params?: RequestParams
  signal?: AbortSignal
  timeout?: number
}
