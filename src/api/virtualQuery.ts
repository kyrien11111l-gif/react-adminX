import { request } from '@/services'
import type {
  VirtualQueryFilters,
  VirtualQueryResult
} from '@/pages/system/virtualQuery/data'

export function queryVirtualData(
  filters: VirtualQueryFilters = {},
  signal?: AbortSignal
): Promise<VirtualQueryResult> {
  return request.post<VirtualQueryResult, VirtualQueryFilters>('/virtual-query', {
    data: filters,
    signal
  })
}
