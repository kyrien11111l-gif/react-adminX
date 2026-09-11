import { useCallback, useState } from 'react'

export interface TableQueryResult<Row> {
  items: Row[]
  total: number
}

interface UseTableQueryOptions<Values, Row> {
  initialData: Row[]
  initialValues: Values
  query: (values: Values) => Promise<TableQueryResult<Row>>
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

  const runQuery = useCallback(
    async (values: Values) => {
      setLastValues(values)
      setLoading(true)

      try {
        const result = await query(values)
        setDataSource(result.items)
        setTotal(result.total)
        return result
      } catch (error) {
        onError?.(error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [onError, query]
  )

  const refresh = useCallback(() => runQuery(lastValues), [lastValues, runQuery])

  return { dataSource, total, loading, lastValues, runQuery, refresh }
}
