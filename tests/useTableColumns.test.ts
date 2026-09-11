import type { TableColumnsType } from 'antd'
import { describe, expect, it } from 'vitest'
import { getColumnSettingsFromColumns } from '@/hooks/useTableColumns'

interface TestRow {
  name: string
  status: string
  computed: string
}

const columns = [
  { title: '名称', dataIndex: 'name' },
  { key: 'status', title: '状态', dataIndex: 'status', hidden: true },
  { key: 'computed', title: () => '动态标题', dataIndex: 'computed' },
  { key: 'actions', title: '操作', fixed: 'right' },
  { title: '无标识列' }
] satisfies TableColumnsType<TestRow>

describe('useTableColumns defaults', () => {
  it('generates settings from column metadata', () => {
    expect(getColumnSettingsFromColumns(columns)).toEqual([
      { key: 'name', label: '名称', visible: true, fixed: false },
      { key: 'status', label: '状态', visible: false, fixed: false },
      { key: 'computed', label: 'computed', visible: true, fixed: false },
      { key: 'actions', label: '操作', visible: true, fixed: 'right' }
    ])
  })
})
