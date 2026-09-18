import { describe, expect, it } from 'vitest'
import {
  VIRTUAL_QUERY_DATA_LENGTH,
  virtualQueryRowsByFilters
} from '@/pages/system/virtualQuery/data'

describe('virtualQueryRowsByFilters', () => {
  it('creates a large result set for virtual scrolling', () => {
    const result = virtualQueryRowsByFilters()

    expect(result.total).toBe(VIRTUAL_QUERY_DATA_LENGTH)
    expect(result.items).toHaveLength(VIRTUAL_QUERY_DATA_LENGTH)
  })

  it('filters the large result set without changing row identity', () => {
    const result = virtualQueryRowsByFilters({
      keyword: 'VQ-000001',
      status: 'processing'
    })

    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({
      id: 1,
      orderNo: 'VQ-000001',
      status: 'processing'
    })
  })

  it('returns a paged slice while preserving the filtered total', () => {
    const result = virtualQueryRowsByFilters({
      pageSize: 100,
      pageCurrent: 2
    })

    expect(result.total).toBe(VIRTUAL_QUERY_DATA_LENGTH)
    expect(result.items).toHaveLength(100)
    expect(result.items[0]).toMatchObject({
      id: 101,
      sequence: 101,
      orderNo: 'VQ-000101'
    })
  })

  it('combines table header text filters', () => {
    const result = virtualQueryRowsByFilters({
      orderNo: 'VQ-000001',
      title: '虚拟第 1 条'
    })

    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({
      id: 1,
      orderNo: 'VQ-000001'
    })
  })
})
