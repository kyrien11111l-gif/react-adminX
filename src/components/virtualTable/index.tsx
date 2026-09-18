import { Table } from 'antd'
import type { TableProps, TableRef } from 'antd'
import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type ReactElement,
  type RefAttributes
} from 'react'
import '@/components/virtualTable/style.css'
import type { VirtualTableProps } from '@/components/virtualTable/type'
import { getResizableTableComponents } from '@/components/resizableTableHeader/merge'
import {
  DEFAULT_VIRTUAL_TABLE_SCROLL_Y,
  getVirtualTableAvailableHeight,
  getVirtualTableBodyHeight
} from '@/components/virtualTable/utils'
import {
  getTableScrollWidth,
  getTableSelectionColumnWidth
} from '@/utils/table'
import { joinClassNames } from '@/utils/classNames'

export type * from '@/components/virtualTable/type'

const measureClassNames = {
  title: 'virtual-table-measure-title',
  header: 'virtual-table-measure-header',
  footer: 'virtual-table-measure-footer',
  pagination: 'virtual-table-measure-pagination',
  summary: 'ant-table-summary'
}

const tableClassNames = {
  title: measureClassNames.title,
  header: {
    wrapper: measureClassNames.header
  },
  footer: measureClassNames.footer,
  pagination: {
    root: measureClassNames.pagination
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

function getElementHeight(element: HTMLElement | null) {
  if (!element) {
    return 0
  }

  const styles = getComputedStyle(element)
  const marginTop = Number.parseFloat(styles.marginTop) || 0
  const marginBottom = Number.parseFloat(styles.marginBottom) || 0

  return element.getBoundingClientRect().height + marginTop + marginBottom
}

function getElementsHeight(root: HTMLElement, className: string) {
  const elements = Array.from(
    root.querySelectorAll<HTMLElement>(`.${className}`)
  )

  return elements
    .filter((element) =>
      elements.every(
        (candidate) => candidate === element || !candidate.contains(element)
      )
    )
    .reduce((height, element) => height + getElementHeight(element), 0)
}

function getTableFixedHeight(root: HTMLElement) {
  return [
    measureClassNames.title,
    measureClassNames.header,
    measureClassNames.footer,
    measureClassNames.summary
  ].reduce(
    (height, className) => height + getElementsHeight(root, className),
    0
  )
}

function getPaginationHeight(root: HTMLElement) {
  return getElementsHeight(root, measureClassNames.pagination)
}

function getPositiveNumber(value: number | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback
}

function VirtualTableInner<RecordType extends object>(
  {
    scroll,
    style,
    components: componentsProp,
    ...restProps
  }: VirtualTableProps<RecordType>,
  ref: ForwardedRef<TableRef>
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<TableRef>(null)
  const isEmpty = !restProps.dataSource?.length
  const [containerMaxHeight, setContainerMaxHeight] = useState<number>()
  const [sectionHeight, setSectionHeight] = useState<number>()
  const [scrollY, setScrollY] = useState(DEFAULT_VIRTUAL_TABLE_SCROLL_Y)
  const selectionColumnWidth = getTableSelectionColumnWidth(
    restProps.rowSelection
  )
  const resolvedScrollX = getTableScrollWidth(
    getPositiveNumber(scroll?.x, 1200),
    selectionColumnWidth
  )
  const rowSelection = restProps.rowSelection
    ? {
        ...restProps.rowSelection,
        columnWidth: selectionColumnWidth
      }
    : undefined
  const components = getResizableTableComponents<RecordType>(componentsProp)
  const scrollYLimit =
    typeof scroll?.y === 'number' && Number.isFinite(scroll.y) && scroll.y > 0
      ? scroll.y
      : Number.POSITIVE_INFINITY

  const setTableRef = useCallback(
    (value: TableRef | null) => {
      tableRef.current = value

      if (typeof ref === 'function') {
        ref(value)
      } else if (ref) {
        ref.current = value
      }
    },
    [ref]
  )

  const measure = useCallback(() => {
    const container = containerRef.current
    const root = tableRef.current?.nativeElement

    if (!container || !root) {
      return
    }

    const containerRect = container.getBoundingClientRect()
    const parentRect = container.parentElement?.getBoundingClientRect()
    const parentBottom =
      parentRect && parentRect.height > 0 ? parentRect.bottom : undefined
    const viewportHeight =
      typeof window !== 'undefined' && Number.isFinite(window.innerHeight)
        ? window.innerHeight
        : undefined
    const availableHeight = getVirtualTableAvailableHeight(
      containerRect.top,
      parentBottom,
      viewportHeight
    )

    if (availableHeight !== undefined && availableHeight > 0) {
      setContainerMaxHeight((current) => {
        const next = Math.max(availableHeight, 1)
        return current === next ? current : next
      })
    }

    const rootRect = root.getBoundingClientRect()
    const currentRootHeight =
      rootRect.height || containerRect.height || availableHeight || 0
    const boundedRootHeight =
      availableHeight === undefined
        ? currentRootHeight
        : Math.min(currentRootHeight, availableHeight)
    const paginationHeight = getPaginationHeight(root)
    const tableHeight = getVirtualTableBodyHeight(
      boundedRootHeight,
      paginationHeight
    )
    const nextScrollY = getVirtualTableBodyHeight(
      tableHeight,
      getTableFixedHeight(root),
      scrollYLimit
    )

    setScrollY((current) => (current === nextScrollY ? current : nextScrollY))
    setSectionHeight((current) =>
      current === tableHeight ? current : tableHeight
    )
  }, [scrollYLimit])

  useLayoutEffect(() => {
    measure()

    const container = containerRef.current
    const root = tableRef.current?.nativeElement
    const parent = container?.parentElement
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(measure)
    const observedElements = [
      container,
      root,
      parent,
      ...(root
        ? Object.values(measureClassNames).flatMap((className) =>
            Array.from(
              root.querySelectorAll<HTMLElement>(`.${className}`)
            )
          )
        : [])
    ]

    observedElements.forEach((element) => {
      if (element && resizeObserver) {
        resizeObserver.observe(element)
      }
    })
    window.addEventListener('resize', measure)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [measure, restProps.dataSource?.length, restProps.pagination])

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
        {...restProps}
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
