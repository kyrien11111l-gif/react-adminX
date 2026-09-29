import type { SortingState } from '@tanstack/react-table'
import type { TablePaginationConfig } from 'antd'
import type { Key, ReactNode } from 'react'
import type { TableColumnSetting } from '@/components/tableToolbar'

export type { TableColumnSetting } from '@/components/tableToolbar'

export interface TanstackColumnSearch {
  value?: string
  placeholder?: string
  onChange: (value?: string) => void
}

export interface TanstackColumnHeaderContext<TData extends object> {
  column: TanstackColumn<TData>
  loading: boolean
  sortOrder: false | 'asc' | 'desc'
  toggleSorting: () => void
  search?: TanstackColumnSearch
}

export interface TanstackColumn<TData extends object> {
  key: string
  title: string
  width?: number
  align?: 'left' | 'center' | 'right'
  fixed?: false | 'left' | 'right'
  hideable?: boolean
  resizable?: boolean
  sortable?: boolean
  search?: TanstackColumnSearch
  renderHeader?: (context: TanstackColumnHeaderContext<TData>) => ReactNode
  renderSort?: (context: TanstackColumnHeaderContext<TData>) => ReactNode
  renderSearch?: (context: TanstackColumnHeaderContext<TData>) => ReactNode
  accessor?: (row: TData) => unknown
  render?: (value: TData[keyof TData], row: TData) => ReactNode
}

export interface TanstackRowSelection {
  type: 'radio' | 'checkbox'
  selectedRowKeys?: Key[]
  defaultSelectedRowKeys?: Key[]
  onChange?: (keys: Key[]) => void
}

export interface TanstackTableProps<TData extends object> {
  columns: TanstackColumn<TData>[]
  dataSource: TData[]
  rowKey: (row: TData) => Key
  loading?: boolean
  virtualize?: boolean
  pagination?: TablePaginationConfig
  rowSelection?: TanstackRowSelection
  size?: 'small' | 'middle' | 'large'
  summary?: ReactNode
  columnSettings?: TableColumnSetting[]
  onColumnSettingsChange?: (settings: TableColumnSetting[]) => void
  onSortChange?: (sorting: SortingState) => void
  getSubRows?: (row: TData) => TData[] | undefined
  renderExpandedRow?: (row: TData) => ReactNode
  rowExpandable?: (row: TData) => boolean
}
