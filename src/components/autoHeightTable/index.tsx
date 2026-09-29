import { Table } from 'antd'
import type { TablePaginationConfig, TableProps } from 'antd'
import {
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties
} from 'react'
import '@/components/autoHeightTable/style.css'
import { addAutoHeightTableFillColumn } from '@/components/autoHeightTable/columns'
import type { AutoHeightTableProps } from '@/components/autoHeightTable/type'
import { getResizableTableComponents } from '@/components/resizableTableHeader/merge'
import {
  getTableScrollWidth,
  getTableSelectionColumnWidth
} from '@/utils/table'
import { joinClassNames } from '@/utils/classNames'
import { useStableTableWidth } from '@/hooks/useStableTableWidth'

export type * from '@/components/autoHeightTable/type'

/* 使用 rc-table 的语义节点建立伸缩布局，避免根据每次 DOM 变化重新测量高度。 */
const tableStyles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0
  } satisfies CSSProperties,
  section: {
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'column',
    minHeight: 0
  } satisfies CSSProperties,
  pagination: {
    root: {
      paddingInline: 'var(--ant-padding, 16px)'
    }
  }
} satisfies NonNullable<TableProps<object>['styles']>

/* antd 在 total 为 0 时不会挂载分页器，用最小内部总数保留分页结构。 */
function normalizePagination(
  pagination: TablePaginationConfig | undefined,
  dataLength: number
) {
  const total = pagination?.total ?? dataLength

  if (total > 0) {
    return pagination ?? {}
  }

  const showTotal = pagination?.showTotal

  return {
    ...pagination,
    total: 1,
    ...(showTotal
      ? {
          showTotal: () => showTotal(0, [0, 0])
        }
      : {})
  }
}

export function AutoHeightTable<RecordType extends object>({
  rootClassName,
  scroll,
  columns,
  style,
  dataSource,
  pagination,
  rowSelection: rowSelectionProp,
  components: componentsProp,
  smoothSidebarResize = false,
  ...restProps
}: AutoHeightTableProps<RecordType>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const isEmpty = !dataSource?.length
  const normalizedPagination =
    pagination === false
      ? false
      : normalizePagination(pagination, dataSource?.length ?? 0)
  const selectionColumnWidth = getTableSelectionColumnWidth(rowSelectionProp)
  const rowSelection = rowSelectionProp
    ? {
        ...rowSelectionProp,
        columnWidth: selectionColumnWidth
      }
    : undefined
  const scrollX = scroll?.x ?? 1200
  const resolvedScrollX =
    typeof scrollX === 'number'
      ? getTableScrollWidth(scrollX, selectionColumnWidth)
      : scrollX
  const resolvedColumns = useMemo(
    () => addAutoHeightTableFillColumn(columns),
    [columns]
  )
  const tableRef = useStableTableWidth(
    smoothSidebarResize,
    containerRef,
    typeof resolvedScrollX === 'number' ? resolvedScrollX : undefined,
    visualRef
  )
  useLayoutEffect(() => {
    const table = tableRef.current?.nativeElement
    const header = table?.querySelector<HTMLElement>('.ant-table-header')
    const body = table?.querySelector<HTMLElement>('.ant-table-body')

    if (header && body && header.scrollLeft !== body.scrollLeft) {
      header.scrollLeft = body.scrollLeft
    }
  }, [resolvedScrollX, tableRef])
  const components = getResizableTableComponents<RecordType>(componentsProp)
  const tableStyle = {
    ...style,
    height: '100%'
  } satisfies CSSProperties

  return (
    <div
      ref={containerRef}
      className={joinClassNames(
        'auto-height-table-container',
        isEmpty ? 'auto-height-table-empty' : null
      )}
    >
      <div ref={visualRef} className="auto-height-table-stable-wrapper">
        <Table<RecordType>
          {...restProps}
          components={components}
          columns={resolvedColumns}
          ref={tableRef}
          dataSource={dataSource}
          pagination={normalizedPagination}
          rowSelection={rowSelection}
          rootClassName={joinClassNames(
            'auto-height-table',
            rootClassName
          )}
          scroll={{
            ...scroll,
            x: resolvedScrollX,
            y: '100%'
          }}
          style={tableStyle}
          styles={tableStyles}
          bordered
        />
      </div>
    </div>
  )
}
