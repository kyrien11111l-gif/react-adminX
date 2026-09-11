import type { ApiResponse } from '@/types'
import { jsonResponse } from '@/mocks/auth'
import {
  queryRowsByFilters,
  type QueryFilters,
  type QueryResult
} from '@/pages/system/query/data'

export function handleMockQuery(filters: QueryFilters | null): Response {
  return jsonResponse<ApiResponse<QueryResult>>({
    code: 0,
    message: 'success',
    data: queryRowsByFilters(filters ?? {})
  })
}
