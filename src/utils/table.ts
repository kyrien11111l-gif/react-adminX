import type { TableProps } from 'antd'

export const DEFAULT_TABLE_SELECTION_COLUMN_WIDTH = 50

function normalizeWidth(value: number) {
  return Number.isFinite(value) ? Math.max(value, 0) : 0
}

export function getTableSelectionColumnWidth<RecordType extends object>(
  rowSelection: TableProps<RecordType>['rowSelection']
) {
  if (!rowSelection) {
    return 0
  }

  const { columnWidth } = rowSelection

  return typeof columnWidth === 'number' && columnWidth > 0
    ? columnWidth
    : DEFAULT_TABLE_SELECTION_COLUMN_WIDTH
}

export function getTableScrollWidth(
  columnWidth: number,
  selectionColumnWidth = 0
) {
  return normalizeWidth(columnWidth) + normalizeWidth(selectionColumnWidth)
}
