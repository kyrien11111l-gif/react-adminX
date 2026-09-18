import { useCallback, useEffect, useRef, useState } from 'react'

export interface TableQueryResult<Row> {
  items: Row[]
  total: number
}

interface UseTableQueryOptions<Values, Row> {
  initialData: Row[]
  initialValues: Values
  query: (
    values: Values,
    signal?: AbortSignal
  ) => Promise<TableQueryResult<Row>>
  onError?: (error: unknown) => void
}

export function useTableQuery<Values, Row>({
  initialData,
  initialValues,
  query,
  onError
}: UseTableQueryOptions<Values, Row>) {
  const [dataSource, setDataSource] = useState(initialData)
  const [total, setTotal] = useState(initialData.length)
  const [loading, setLoading] = useState(false)
  const [lastValues, setLastValues] = useState(initialValues)
  const initialQueryStarted = useRef(false)
  const activeRequest = useRef<AbortController | null>(null)

  const runQuery = useCallback(
    async (values: Values) => {
      activeRequest.current?.abort()
      const controller = new AbortController()
      activeRequest.current = controller
      setLastValues(values)
      setDataSource([])
      setLoading(true)

      try {
        const result = await query(values, controller.signal)
        if (controller.signal.aborted) {
          return null
        }

        setDataSource(result.items)
        setTotal(result.total)
        return result
      } catch (error) {
        if (controller.signal.aborted) {
          return null
        }

        onError?.(error)
        return null
      } finally {
        if (activeRequest.current === controller) {
          activeRequest.current = null
          setLoading(false)
        }
      }
    },
    [onError, query]
  )

  useEffect(
    () => () => {
      activeRequest.current?.abort()
      activeRequest.current = null
    },
    []
  )

  useEffect(() => {
    if (initialQueryStarted.current) {
      return
    }

    initialQueryStarted.current = true
    void runQuery(initialValues)
  }, [initialValues, runQuery])

  const refresh = useCallback(() => runQuery(lastValues), [lastValues, runQuery])

  return { dataSource, total, loading, lastValues, runQuery, refresh }
}
