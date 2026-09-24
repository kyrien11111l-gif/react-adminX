import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import {
  DEFAULT_VIRTUAL_TABLE_SCROLL_Y,
  getVirtualTableAvailableHeight,
  getVirtualTableBodyHeight
} from '@/components/virtualTable/utils'
import { useStableTableWidth } from '@/hooks/useStableTableWidth'

export const tableMeasureClassNames = {
  title: 'virtual-table-measure-title',
  header: 'virtual-table-measure-header',
  footer: 'virtual-table-measure-footer',
  pagination: 'virtual-table-measure-pagination',
  summary: 'ant-table-summary'
}

interface UseTableViewportOptions {
  dataLength: number
  density?: string
  scrollYLimit?: number
  smoothSidebarResize?: boolean
}

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
    tableMeasureClassNames.title,
    tableMeasureClassNames.header,
    tableMeasureClassNames.footer,
    tableMeasureClassNames.summary
  ].reduce(
    (height, className) => height + getElementsHeight(root, className),
    0
  )
}

function getPaginationHeight(root: HTMLElement) {
  return getElementsHeight(root, tableMeasureClassNames.pagination)
}

export function useTableViewport({
  dataLength,
  density,
  scrollYLimit = Number.POSITIVE_INFINITY,
  smoothSidebarResize = false
}: UseTableViewportOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tableRef = useStableTableWidth(smoothSidebarResize, containerRef)
  const [containerMaxHeight, setContainerMaxHeight] = useState<number>()
  const [sectionHeight, setSectionHeight] = useState<number>()
  const [scrollY, setScrollY] = useState(DEFAULT_VIRTUAL_TABLE_SCROLL_Y)

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

    setScrollY((current) => current === nextScrollY ? current : nextScrollY)
    setSectionHeight((current) =>
      current === tableHeight ? current : tableHeight
    )
  }, [scrollYLimit, tableRef])

  useLayoutEffect(() => {
    measure()

    const container = containerRef.current
    const root = tableRef.current?.nativeElement
    const parent = container?.parentElement
    const observedElements = [
      container,
      root,
      parent,
      ...(root
        ? Object.values(tableMeasureClassNames).flatMap((className) =>
            Array.from(root.querySelectorAll<HTMLElement>(`.${className}`))
          )
        : [])
    ]
    const observedHeights = new WeakMap<Element, number>()
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver((entries) => {
          let heightChanged = false

          entries.forEach((entry) => {
            const height = entry.contentRect.height
            const previousHeight = observedHeights.get(entry.target)
            observedHeights.set(entry.target, height)
            heightChanged ||= previousHeight === undefined ||
              Math.abs(height - previousHeight) > 0.5
          })

          if (heightChanged) {
            measure()
          }
        })

    observedElements.forEach((element) => {
      if (element) {
        resizeObserver?.observe(element)
      }
    })
    window.addEventListener('resize', measure)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [dataLength, density, measure, tableRef])

  return {
    containerRef,
    tableRef,
    containerMaxHeight,
    sectionHeight,
    scrollY
  }
}
