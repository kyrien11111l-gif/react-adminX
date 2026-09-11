import { describe, expect, it } from 'vitest'
import { queryRowsByFilters } from '@/pages/system/query/data'

describe('queryRowsByFilters', () => {
  it('returns all mock rows without filters', () => {
    const result = queryRowsByFilters()

    expect(result.total).toBe(40)
    expect(result.items).toHaveLength(40)
  })

  it('combines text, status and date filters', () => {
    const result = queryRowsByFilters({
      keyword: '报表',
      status: 'completed',
      startDate: '2026-09-01',
      endDate: '2026-09-08'
    })

    expect(result.items).toEqual([
      expect.objectContaining({ id: 2, title: '8 月经营分析报表' }),
      expect.objectContaining({ id: 9, title: '销售目标达成率报表' }),
      expect.objectContaining({ id: 15, title: '月度财务报表导出' }),
      expect.objectContaining({ id: 23, title: '渠道转化率分析报表' }),
      expect.objectContaining({ id: 26, title: '库存周转率报表导出' }),
      expect.objectContaining({ id: 31, title: '人力成本分析报表' })
    ])
  })
})
