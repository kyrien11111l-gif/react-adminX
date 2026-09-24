import type { TableProps } from 'antd'

export type AutoHeightTableProps<RecordType extends object> = Omit<
  TableProps<RecordType>,
  'classNames' | 'styles'
> & {
  smoothSidebarResize?: boolean
}
