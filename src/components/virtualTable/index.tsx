import { Table } from 'antd'
import type { TableProps, TableRef } from 'antd'
import {
  forwardRef,
  useCallback,
  type CSSProperties,
  type ForwardedRef,
  type ReactElement,
  type RefAttributes
} from 'react'
import '@/components/virtualTable/style.css'
import type { VirtualTableProps } from '@/components/virtualTable/type'
import { getResizableTableComponents } from '@/components/resizableTableHeader/merge'
import { useTableViewport, tableMeasureClassNames } from '@/hooks/useTableViewport'
import { getTableScrollWidth, getTableSelectionColumnWidth } from '@/utils/table'
import { joinClassNames } from '@/utils/classNames'

export type * from '@/components/virtualTable/type'

const tableClassNames = {
  title: tableMeasureClassNames.title,
  header: {
    wrapper: tableMeasureClassNames.header
  },
  footer: tableMeasureClassNames.footer,
  pagination: {
    root: tableMeasureClassNames.pagination
  }
} satisfies NonNullable<TableProps<object>['classNames']>

const baseTableStyles = {
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
    } satisfies CSSProperties
  }
} satisfies NonNullable<TableProps<object>['styles']>

function getPositiveNumber(value: number | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback
}

function VirtualTableInner<RecordType extends object>(
  {
    scroll,
    style,
    components: customComponents,
    smoothSidebarResize = true,
    ...tableProps
  }: VirtualTableProps<RecordType>,
  ref: ForwardedRef<TableRef>
) {
  const isEmpty = !tableProps.dataSource?.length
  const selectionColumnWidth = getTableSelectionColumnWidth(
    tableProps.rowSelection
  )
  const resolvedScrollX = getTableScrollWidth(
    getPositiveNumber(scroll?.x, 1200),
    selectionColumnWidth
  )
  const rowSelection = tableProps.rowSelection
    ? {
        ...tableProps.rowSelection,
        columnWidth: selectionColumnWidth
      }
    : undefined
  const components = getResizableTableComponents<RecordType>(customComponents)
  const scrollYLimit =
    typeof scroll?.y === 'number' && Number.isFinite(scroll.y) && scroll.y > 0
      ? scroll.y
      : Number.POSITIVE_INFINITY
  const {
    containerRef,
    tableRef,
    containerMaxHeight,
    sectionHeight,
    scrollY
  } = useTableViewport({
    dataLength: tableProps.dataSource?.length ?? 0,
    density: tableProps.size,
    scrollYLimit,
    smoothSidebarResize
  })

  const setTableRef = useCallback(
    (value: TableRef | null) => {
      tableRef.current = value

      if (typeof ref === 'function') {
        ref(value)
      } else if (ref) {
        ref.current = value
      }
    },
    [ref, tableRef]
  )

  const tableStyles = {
    ...baseTableStyles,
    root: {
      ...baseTableStyles.root,
      height: '100%'
    },
    section: {
      ...baseTableStyles.section,
      ...(sectionHeight === undefined ? {} : { height: sectionHeight })
    }
  } satisfies NonNullable<TableProps<object>['styles']>
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    maxHeight:
      containerMaxHeight === undefined
        ? 'min(100%, 100dvh)'
        : `${containerMaxHeight}px`,
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
    width: '100%'
  }

  return (
    <div
      ref={containerRef}
      className={joinClassNames(
        'virtual-table-container',
        isEmpty ? 'virtual-table-empty' : null
      )}
      style={containerStyle}
    >
      <Table<RecordType>
        {...tableProps}
        components={components}
        ref={setTableRef}
        rowSelection={rowSelection}
        virtual
        scroll={{
          ...scroll,
          x: resolvedScrollX,
          y: Math.max(scrollY, 1)
        }}
        style={{ ...style, height: '100%' }}
        classNames={tableClassNames}
        styles={tableStyles}
      />
    </div>
  )
}

export const VirtualTable = forwardRef(VirtualTableInner) as <
  RecordType extends object
>(
  props: VirtualTableProps<RecordType> & RefAttributes<TableRef>
) => ReactElement
