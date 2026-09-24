import { useState } from 'react'
import type {
  TableDensity,
  TableToolbarProps
} from '@/components/tableToolbar/type'
import {
  useTableColumns,
  type UseTableColumnsOptions
} from '@/hooks/useTableColumns'

const EMPTY_COLUMNS: never[] = []

type DensityToolbarProps = Required<
  Pick<TableToolbarProps, 'density' | 'onDensityChange'>
>

type ColumnToolbarProps = Required<
  Pick<
    TableToolbarProps,
    'columnSettings' | 'onColumnSettingsChange' | 'onColumnSettingsReset'
  >
>

interface DensitySettings {
  density: TableDensity
  toolbarProps: DensityToolbarProps
}

type ColumnSettings<RecordType> = ReturnType<
  typeof useTableColumns<RecordType>
> & {
  density: TableDensity
  toolbarProps: DensityToolbarProps & ColumnToolbarProps
}

export function useTableSettings(): DensitySettings
export function useTableSettings<RecordType>(
  options: UseTableColumnsOptions<RecordType>
): ColumnSettings<RecordType>
export function useTableSettings<RecordType>(
  options?: UseTableColumnsOptions<RecordType>
): DensitySettings | ColumnSettings<RecordType> {
  const [density, setDensity] = useState<TableDensity>('medium')
  const columnState = useTableColumns<RecordType>({
    columns: options?.columns ?? EMPTY_COLUMNS,
    defaultSettings: options?.defaultSettings
  })

  const densityToolbarProps = {
    density,
    onDensityChange: setDensity
  }

  if (!options) {
    return { density, toolbarProps: densityToolbarProps }
  }

  return {
    ...columnState,
    density,
    toolbarProps: {
      ...densityToolbarProps,
      columnSettings: columnState.columnSettings,
      onColumnSettingsChange: columnState.onColumnSettingsChange,
      onColumnSettingsReset: columnState.resetColumnSettings
    }
  }
}
