import { describe, expect, it } from 'vitest'
import type { QueryFormField } from '@/components/queryForm'
import { getVisibleQueryFields } from '@/components/queryForm/utils'

interface TestValues {
  keyword?: string
  category?: string
  status?: string
}

const fields: QueryFormField<TestValues>[] = [
  { type: 'input', name: 'keyword', label: '关键词' },
  { type: 'select', name: 'category', label: '分类' },
  { type: 'custom', name: 'status', label: '状态', render: () => null }
]

describe('QueryForm', () => {
  it('shows only the configured common fields when collapsed', () => {
    expect(getVisibleQueryFields(fields, false, 2)).toEqual(fields.slice(0, 2))
  })

  it('shows every field when expanded', () => {
    expect(getVisibleQueryFields(fields, true, 2)).toEqual(fields)
  })

  it('handles a negative collapsed field count safely', () => {
    expect(getVisibleQueryFields(fields, false, -1)).toEqual([])
  })
})
