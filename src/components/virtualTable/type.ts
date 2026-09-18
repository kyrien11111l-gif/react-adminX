import type { TableProps } from 'antd'

export type VirtualTableScroll<RecordType extends object> = Omit<
  NonNullable<TableProps<RecordType>['scroll']>,
  'x' | 'y'
> & {
  x?: number
  y?: number
}

export type VirtualTableProps<RecordType extends object> = Omit<
  TableProps<RecordType>,
  'classNames' | 'scroll' | 'styles' | 'virtual'
> & {
  scroll?: VirtualTableScroll<RecordType>
}
