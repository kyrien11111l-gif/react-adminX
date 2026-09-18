import type { ApiResponse } from '@/types'
import { jsonResponse } from '@/mocks/auth'
import {
  virtualQueryRowsByFilters,
  type VirtualQueryFilters,
  type VirtualQueryResult
} from '@/pages/system/virtualQuery/data'

export function handleMockVirtualQuery(
  filters: VirtualQueryFilters | null
): Response {
  return jsonResponse<ApiResponse<VirtualQueryResult>>({
    code: 0,
    message: 'success',
    data: virtualQueryRowsByFilters(filters ?? {})
  })
}
