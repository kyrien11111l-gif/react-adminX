import type { TablePaginationConfig } from 'antd'
import { useCallback, useMemo, useState } from 'react'

export interface UseTablePaginationOptions {
  total: number
  defaultPageCurrent?: number
  defaultPageSize?: number
  pageSizeOptions?: number[]
  onChange?: (page: number, pageSize: number) => void
}

const defaultPageSizeOptions = [10, 20, 50, 100]

export function useTablePagination({
  total,
  defaultPageCurrent = 1,
  defaultPageSize = 20,
  pageSizeOptions = defaultPageSizeOptions,
  onChange
}: UseTablePaginationOptions) {
  const [current, setCurrent] = useState(defaultPageCurrent)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const handleChange = useCallback(
    (nextCurrent: number, nextPageSize: number) => {
      setCurrent(nextCurrent)
      setPageSize(nextPageSize)
      onChange?.(nextCurrent, nextPageSize)
    },
    [onChange]
  )
  const resetPagination = useCallback(() => {
    setCurrent(1)
  }, [])
  const maxCurrent = Math.max(1, Math.ceil(total / pageSize))
  const pagination = useMemo<TablePaginationConfig>(
    () => ({
      current: Math.min(current, maxCurrent),
      pageSize,
      total,
      pageSizeOptions,
      showQuickJumper: true,
      showSizeChanger: true,
      responsive: true,
      showTotal: (pageTotal) => `共 ${pageTotal} 条`,
      onChange: handleChange
    }),
    [current, handleChange, maxCurrent, pageSize, pageSizeOptions, total]
  )

  return {
    pagination,
    current,
    pageSize,
    resetPagination
  }
}
