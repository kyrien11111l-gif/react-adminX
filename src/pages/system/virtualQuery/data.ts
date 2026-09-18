import type {
  QueryCategory,
  QueryPriority,
  QueryRow,
  QuerySource,
  QueryStatus
} from '@/pages/system/query/data'
import { queryRows } from '@/pages/system/query/data'

export type { QueryCategory, QueryPriority, QuerySource, QueryStatus }

export type VirtualQueryHeaderFilterKey =
  | 'orderNo'
  | 'title'
  | 'applicant'
  | 'department'
  | 'description'

export interface VirtualQueryFilters {
  keyword?: string
  category?: QueryCategory | 'all'
  status?: QueryStatus | 'all'
  orderNo?: string
  title?: string
  applicant?: string
  department?: string
  description?: string
  pageSize?: number
  pageCurrent?: number
}

export interface VirtualQueryRow extends QueryRow {
  sequence: number
}

export interface VirtualQueryResult {
  items: VirtualQueryRow[]
  total: number
}

export const VIRTUAL_QUERY_DATA_LENGTH = 10_000

export const virtualQueryRows: VirtualQueryRow[] = Array.from(
  { length: VIRTUAL_QUERY_DATA_LENGTH },
  (_, index) => {
    const source = queryRows[index % queryRows.length]
    const sequence = index + 1
    const sequenceLabel = String(sequence).padStart(6, '0')

    return {
      ...source,
      id: sequence,
      sequence,
      orderNo: `VQ-${sequenceLabel}`,
      title: `${source.title}（虚拟第 ${sequence} 条）`,
      requestId: `VREQ-${sequenceLabel}-${source.requestId}`,
      description: `${source.title}的虚拟滚动演示记录，序号为 ${sequence}，用于验证大量数据下的快速渲染与滚动。`,
      remark: `这是第 ${sequence} 条虚拟列表模拟数据，保留较长备注以验证单元格省略和横向滚动。`
    }
  }
)

function matchesKeyword(record: VirtualQueryRow, keyword: string) {
  return [
    record.orderNo,
    record.title,
    record.applicant,
    record.requestId,
    record.description,
    record.remark
  ].some((value) => value.toLowerCase().includes(keyword))
}

function normalizePositiveInteger(value: number | undefined, fallback: number) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : fallback
}

export function virtualQueryRowsByFilters(
  filters: VirtualQueryFilters = {}
): VirtualQueryResult {
  const keyword = filters.keyword?.trim().toLowerCase() ?? ''
  const orderNo = filters.orderNo?.trim().toLowerCase() ?? ''
  const title = filters.title?.trim().toLowerCase() ?? ''
  const applicant = filters.applicant?.trim().toLowerCase() ?? ''
  const department = filters.department?.trim().toLowerCase() ?? ''
  const description = filters.description?.trim().toLowerCase() ?? ''
  const items = virtualQueryRows.filter((record) => {
    const matchesCategory =
      !filters.category ||
      filters.category === 'all' ||
      record.category === filters.category
    const matchesStatus =
      !filters.status || filters.status === 'all' || record.status === filters.status
    const matchesColumnText =
      (!orderNo || record.orderNo.toLowerCase().includes(orderNo)) &&
      (!title || record.title.toLowerCase().includes(title)) &&
      (!applicant || record.applicant.toLowerCase().includes(applicant)) &&
      (!department || record.department.toLowerCase().includes(department)) &&
      (!description || record.description.toLowerCase().includes(description))

    return (
      (!keyword || matchesKeyword(record, keyword)) &&
      matchesCategory &&
      matchesStatus &&
      matchesColumnText
    )
  })
  const pageSize = normalizePositiveInteger(filters.pageSize, items.length || 1)
  const pageCurrent = normalizePositiveInteger(filters.pageCurrent, 1)
  const startIndex = (pageCurrent - 1) * pageSize

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    total: items.length
  }
}
