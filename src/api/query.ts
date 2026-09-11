import { request } from '@/services'
import type {
  QueryFilters,
  QueryResult
} from '@/pages/system/query/data'

export function queryData(
  filters: QueryFilters = {},
  signal?: AbortSignal
): Promise<QueryResult> {
  return request.post<QueryResult, QueryFilters>('/query', filters, { signal })
}
