import { Table } from 'antd'
import type { GetRef } from 'antd'
import { useEffect, useRef, useState } from 'react'
import type { AutoHeightTableProps } from '@/components/autoHeightTable/type'

export type * from '@/components/autoHeightTable/type'

const measureClassNames = {
  header: 'auto-height-table-header',
  pagination: 'auto-height-table-pagination'
}

const tableClassNames = {
  header: {
    wrapper: measureClassNames.header
  },
  pagination: {
    root: measureClassNames.pagination
  }
}

/* 分页内容与表格边缘保留统一的水平间距。 */
const tableStyles = {
  pagination: {
    root: {
      paddingInline: 'var(--ant-padding, 16px)'
    }
  }
}

export function AutoHeightTable<RecordType extends object>(
  props: AutoHeightTableProps<RecordType>
) {
  const { rootClassName, scroll, style, ...restProps } = props
  const rootRef = useRef<GetRef<typeof Table>>(null)
  const [scrollY, setScrollY] = useState(0)
  const [sectionHeight, setSectionHeight] = useState(0)
  const tableRootClassName = ['auto-height-table', rootClassName]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    const element = rootRef.current?.nativeElement

    if (!element || typeof ResizeObserver === 'undefined') {
      return
    }

    const getHeight = (className: string | HTMLElement) => {
      const target =
        typeof className === 'string'
          ? element.querySelector<HTMLElement>(`.${className}`)
          : className

      if (!target) {
        return 0
      }

      const targetStyles = getComputedStyle(target)
      const marginTop = Number.parseFloat(targetStyles.marginTop) || 0
      const marginBottom = Number.parseFloat(targetStyles.marginBottom) || 0

      return target.getBoundingClientRect().height + marginTop + marginBottom
    }

    const measure = () => {
      const totalHeight = element.getBoundingClientRect().height
      const headerHeight = getHeight(measureClassNames.header)
      const paginationHeight = getHeight(measureClassNames.pagination)

      setScrollY(
        Math.max(0, Math.floor(totalHeight - headerHeight - paginationHeight))
      )
      setSectionHeight(Math.max(0, totalHeight - paginationHeight))
    }

    measure()

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <Table<RecordType>
      bordered
      {...restProps}
      ref={rootRef}
      rootClassName={tableRootClassName}
      scroll={{ ...scroll, y: scrollY }}
      style={{ ...style, height: '100%' }}
      styles={{
        ...tableStyles,
        section: {
          height: sectionHeight
        }
      }}
      classNames={tableClassNames}
    />
  )
}
