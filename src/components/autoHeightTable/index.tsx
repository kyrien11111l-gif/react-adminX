import { Table } from 'antd'
import type { TablePaginationConfig, TableProps, TableRef } from 'antd'
import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import '@/components/autoHeightTable/style.css'
import type { AutoHeightTableProps } from '@/components/autoHeightTable/type'
import { getResizableTableComponents } from '@/components/resizableTableHeader/merge'
import {
  getTableScrollWidth,
  getTableSelectionColumnWidth
} from '@/utils/table'
import { joinClassNames } from '@/utils/classNames'

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
  style,
  dataSource,
  pagination,
  rowSelection: rowSelectionProp,
  components: componentsProp,
  ...restProps
}: AutoHeightTableProps<RecordType>) {
  const tableRef = useRef<TableRef>(null)
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
  const components = getResizableTableComponents<RecordType>(componentsProp)

  useLayoutEffect(() => {
    if (!isEmpty) {
      return
    }

    const body = tableRef.current?.nativeElement.querySelector<HTMLElement>(
      '.ant-table-body'
    )

    if (!body) {
      return
    }

    const updateEmptyContentWidth = () => {
      body.style.setProperty(
        '--auto-height-table-empty-content-width',
        `${body.clientWidth}px`
      )
    }
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(updateEmptyContentWidth)

    updateEmptyContentWidth()
    resizeObserver?.observe(body)

    return () => {
      resizeObserver?.disconnect()
      body.style.removeProperty('--auto-height-table-empty-content-width')
    }
  }, [isEmpty])

  return (
    <Table<RecordType>
      {...restProps}
      components={components}
      ref={tableRef}
      dataSource={dataSource}
      pagination={normalizedPagination}
      rowSelection={rowSelection}
      rootClassName={joinClassNames(
        'auto-height-table',
        isEmpty ? 'auto-height-table-empty' : null,
        rootClassName
      )}
      scroll={{
        ...scroll,
        x: resolvedScrollX,
        y: '100%'
      }}
      style={{ ...style, height: '100%' }}
      styles={tableStyles}
      bordered
    />
  )
}
