import type { TableColumnsType } from 'antd'

const AUTO_HEIGHT_TABLE_FILL_COLUMN_KEY = '__auto_height_table_fill__'
const AUTO_HEIGHT_TABLE_FILL_CELL_CLASS = 'auto-height-table-fill-cell'
const AUTO_HEIGHT_TABLE_FILL_WITH_FIXED_RIGHT_CLASS =
  'auto-height-table-fill-cell-with-fixed-right'

type AutoHeightTableColumn<RecordType extends object> =
  TableColumnsType<RecordType>[number]

function containsFixedRightColumn<RecordType extends object>(
  column: AutoHeightTableColumn<RecordType>
): boolean {
  if (
    'fixed' in column &&
    (column.fixed === 'right' || column.fixed === 'end')
  ) {
    return true
  }

  return (
    'children' in column &&
    Array.isArray(column.children) &&
    column.children.some(containsFixedRightColumn)
  )
}

export function addAutoHeightTableFillColumn<RecordType extends object>(
  columns: TableColumnsType<RecordType> | undefined
) {
  if (
    !columns?.length ||
    columns.some(
      (column) =>
        'key' in column && column.key === AUTO_HEIGHT_TABLE_FILL_COLUMN_KEY
    )
  ) {
    return columns
  }

  const fixedRightIndex = columns.findIndex(containsFixedRightColumn)
  const fillCellClassName = [
    AUTO_HEIGHT_TABLE_FILL_CELL_CLASS,
    fixedRightIndex === -1
      ? null
      : AUTO_HEIGHT_TABLE_FILL_WITH_FIXED_RIGHT_CLASS
  ]
    .filter(Boolean)
    .join(' ')
  const fillColumn: AutoHeightTableColumn<RecordType> = {
    key: AUTO_HEIGHT_TABLE_FILL_COLUMN_KEY,
    title: '',
    onCell: () => ({
      'aria-hidden': true,
      className: fillCellClassName
    }),
    onHeaderCell: () => ({
      'aria-hidden': true,
      className: fillCellClassName
    })
  }

  if (fixedRightIndex === -1) {
    return [...columns, fillColumn]
  }

  return [
    ...columns.slice(0, fixedRightIndex),
    fillColumn,
    ...columns.slice(fixedRightIndex)
  ]
}
