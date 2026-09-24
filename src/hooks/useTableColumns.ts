import type { TableColumnsType } from 'antd'
import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { ResizableHeaderCellProps } from '@/components/resizableTableHeader'
import type {
  TableColumnFixed,
  TableColumnSetting
} from '@/components/tableToolbar/type'

const DEFAULT_COLUMN_WIDTH = 160
const MIN_COLUMN_WIDTH = 80
const MAX_COLUMN_WIDTH = 600

export interface UseTableColumnsOptions<RecordType> {
  columns: TableColumnsType<RecordType>
  /** 未提供时按 columns 的元数据自动生成列设置。 */
  defaultSettings?: TableColumnSetting[]
}

function cloneSettings(settings: TableColumnSetting[]) {
  return settings.map((setting) => ({ ...setting }))
}

type TableColumn<RecordType> = TableColumnsType<RecordType>[number]

function getColumnKey<RecordType>(column: TableColumn<RecordType>) {
  if (column.key !== undefined && column.key !== null) {
    return String(column.key)
  }

  if ('dataIndex' in column && column.dataIndex !== undefined) {
    const key = Array.isArray(column.dataIndex)
      ? column.dataIndex.map((part) => String(part)).join('.')
      : String(column.dataIndex)

    return key || undefined
  }

  return undefined
}

function getColumnLabel<RecordType>(
  column: TableColumn<RecordType>,
  key: string
): ReactNode {
  if (
    column.title === undefined ||
    column.title === null ||
    typeof column.title === 'function'
  ) {
    return key
  }

  return column.title
}

function getColumnFixed<RecordType>(
  column: TableColumn<RecordType>
): TableColumnFixed {
  if (
    column.fixed === true ||
    column.fixed === 'left' ||
    column.fixed === 'start'
  ) {
    return 'left'
  }

  if (column.fixed === 'right' || column.fixed === 'end') {
    return 'right'
  }

  return false
}

export function clampTableColumnWidth(width: number) {
  return Math.min(
    Math.max(Math.round(width), MIN_COLUMN_WIDTH),
    MAX_COLUMN_WIDTH
  )
}

function getColumnWidth<RecordType>(column: TableColumn<RecordType>) {
  return clampTableColumnWidth(
    typeof column.width === 'number' && Number.isFinite(column.width)
      ? column.width
      : DEFAULT_COLUMN_WIDTH
  )
}

export function getColumnSettingsFromColumns<RecordType>(
  columns: TableColumnsType<RecordType>
): TableColumnSetting[] {
  return columns.flatMap((column) => {
    const key = getColumnKey(column)

    if (!key) {
      return []
    }

    return [
      {
        key,
        label: getColumnLabel(column, key),
        visible: column.hidden !== true,
        fixed: getColumnFixed(column),
        width: getColumnWidth(column)
      }
    ]
  })
}

function mergeGeneratedSettings(
  currentSettings: TableColumnSetting[],
  generatedSettings: TableColumnSetting[]
) {
  const generatedByKey = new Map(
    generatedSettings.map((setting) => [setting.key, setting])
  )
  const currentKeys = new Set(currentSettings.map((setting) => setting.key))
  const syncedSettings = currentSettings.flatMap((setting) => {
    const generatedSetting = generatedByKey.get(setting.key)

    if (!generatedSetting) {
      return []
    }

    return [
      {
        ...generatedSetting,
        visible: setting.visible,
        fixed: setting.fixed,
        width: setting.width ?? generatedSetting.width,
        ...(setting.disabled === undefined
          ? {}
          : { disabled: setting.disabled })
      }
    ]
  })
  const addedSettings = generatedSettings.filter(
    (setting) => !currentKeys.has(setting.key)
  )

  return [...syncedSettings, ...addedSettings]
}

export function useTableColumns<RecordType>({
  columns,
  defaultSettings
}: UseTableColumnsOptions<RecordType>) {
  const generatedSettings = useMemo(
    () => getColumnSettingsFromColumns(columns),
    [columns]
  )
  const resolvedDefaultSettings = useMemo(
    () =>
      defaultSettings === undefined
        ? generatedSettings
        : mergeGeneratedSettings(defaultSettings, generatedSettings),
    [defaultSettings, generatedSettings]
  )
  const [storedColumnSettings, setStoredColumnSettings] = useState(() =>
    cloneSettings(resolvedDefaultSettings)
  )
  const columnSettings = useMemo(
    () =>
      defaultSettings === undefined
        ? mergeGeneratedSettings(storedColumnSettings, generatedSettings)
        : storedColumnSettings,
    [defaultSettings, generatedSettings, storedColumnSettings]
  )

  const resizeColumn = useCallback(
    (key: string, width: number) => {
      setStoredColumnSettings((currentSettings) =>
        mergeGeneratedSettings(currentSettings, generatedSettings).map(
          (setting) =>
            setting.key === key
              ? { ...setting, width: clampTableColumnWidth(width) }
              : setting
        )
      )
    },
    [generatedSettings]
  )

  const tableColumns = useMemo(
    () =>
      [
        ...columnSettings.filter((setting) => setting.fixed === 'left'),
        ...columnSettings.filter((setting) => setting.fixed === false),
        ...columnSettings.filter((setting) => setting.fixed === 'right')
      ].flatMap((setting) => {
        const column = columns.find(
          (currentColumn) => getColumnKey(currentColumn) === setting.key
        )

        if (!column || !setting.visible) {
          return []
        }

        const originalOnHeaderCell = column.onHeaderCell
        const width = setting.width ?? getColumnWidth(column)

        return [
          {
            ...column,
            fixed: setting.fixed || undefined,
            width,
            onHeaderCell: (
              currentColumn: Parameters<
                NonNullable<typeof originalOnHeaderCell>
              >[0]
            ) => {
              const originalProps = originalOnHeaderCell?.(currentColumn)
              const headerCellProps: ResizableHeaderCellProps = {
                ...originalProps,
                maxWidth: MAX_COLUMN_WIDTH,
                minWidth: MIN_COLUMN_WIDTH,
                onColumnResize: (nextWidth) =>
                  resizeColumn(setting.key, nextWidth),
                resizeLabel:
                  typeof setting.label === 'string'
                    ? `${setting.label}列`
                    : `“${setting.key}”列`,
                width
              }

              return headerCellProps
            }
          }
        ]
      }),
    [columnSettings, columns, resizeColumn]
  )

  const tableScrollX = useMemo(
    () =>
      columnSettings.reduce(
        (total, setting) =>
          setting.visible
            ? total + (setting.width ?? DEFAULT_COLUMN_WIDTH)
            : total,
        0
      ),
    [columnSettings]
  )

  const resetColumnSettings = useCallback(() => {
    setStoredColumnSettings(cloneSettings(resolvedDefaultSettings))
  }, [resolvedDefaultSettings])

  return {
    columnSettings,
    tableColumns,
    tableScrollX,
    onColumnSettingsChange: setStoredColumnSettings,
    resetColumnSettings
  }
}
