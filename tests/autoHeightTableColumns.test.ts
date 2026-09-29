import type { TableColumnsType } from 'antd'
import { describe, expect, it } from 'vitest'
import { addAutoHeightTableFillColumn } from '@/components/autoHeightTable/columns'

interface TableRow {
  id: number
}

describe('addAutoHeightTableFillColumn', () => {
  it('puts an unbounded fill column before fixed right columns', () => {
    const columns: TableColumnsType<TableRow> = [
      { key: 'name', dataIndex: 'id' },
      { key: 'action', fixed: 'right', title: '操作' }
    ]

    const resolvedColumns = addAutoHeightTableFillColumn(columns)
    const fillColumn = resolvedColumns?.[1]

    expect(resolvedColumns?.map((column) => column.key)).toEqual([
      'name',
      '__auto_height_table_fill__',
      'action'
    ])
    expect(fillColumn?.width).toBeUndefined()
    expect(fillColumn?.onCell?.({ id: 1 }, 0)).toMatchObject({
      'aria-hidden': true,
      className:
        'auto-height-table-fill-cell auto-height-table-fill-cell-with-fixed-right'
    })
  })

  it('adds the fill column after ordinary columns', () => {
    const columns: TableColumnsType<TableRow> = [
      { key: 'name', dataIndex: 'id' }
    ]

    expect(
      addAutoHeightTableFillColumn(columns)?.map((column) => column.key)
    ).toEqual(['name', '__auto_height_table_fill__'])
  })

  it('does not change absent, empty, or already resolved columns', () => {
    const columns: TableColumnsType<TableRow> = [
      { key: '__auto_height_table_fill__', title: '' }
    ]

    expect(addAutoHeightTableFillColumn<TableRow>(undefined)).toBeUndefined()
    expect(addAutoHeightTableFillColumn<TableRow>([])).toEqual([])
    expect(addAutoHeightTableFillColumn(columns)).toBe(columns)
  })
})
