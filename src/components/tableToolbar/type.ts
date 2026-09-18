import type { ReactNode } from 'react'

export type TableDensity = 'large' | 'medium' | 'small'
export type TableColumnFixed = false | 'left' | 'right'

export interface TableColumnSetting {
  key: string
  label: ReactNode
  visible: boolean
  fixed: TableColumnFixed
  width?: number
  disabled?: boolean
}

export interface TableToolbarProps {
  title?: ReactNode
  actions?: ReactNode
  extra?: ReactNode
  onRefresh?: () => void | Promise<void>
  refreshing?: boolean
  density?: TableDensity
  onDensityChange?: (density: TableDensity) => void
  columnSettings?: TableColumnSetting[]
  onColumnSettingsChange?: (settings: TableColumnSetting[]) => void
  onColumnSettingsReset?: () => void
}
