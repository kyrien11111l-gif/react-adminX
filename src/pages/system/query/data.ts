export type QueryStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type QueryCategory = 'data-sync' | 'report' | 'access-review'
export type QueryPriority = 'high' | 'medium' | 'low'
export type QuerySource = 'portal' | 'api' | 'schedule' | 'import'

export interface QueryFilters {
  keyword?: string
  category?: QueryCategory | 'all'
  status?: QueryStatus | 'all'
  applicant?: string
  title?: string
  startDate?: string
  endDate?: string
}

export interface QueryRow {
  id: number
  orderNo: string
  title: string
  category: QueryCategory
  applicant: string
  status: QueryStatus
  updatedAt: string
  department: string
  priority: QueryPriority
  processor: string
  source: QuerySource
  duration: string
}

export interface QueryResult {
  items: QueryRow[]
  total: number
}

const queryDepartments = ['华东大区', '财务部', '供应链部', '人力资源部']
const queryPriorities: QueryPriority[] = ['high', 'medium', 'low']
const queryProcessors = ['张敏', '周凯', '陈璐', '赵博', '孙怡']
const querySources: QuerySource[] = ['portal', 'api', 'schedule', 'import']
const queryDurations = ['2 分钟', '15 分钟', '1 小时', '3 小时', '1 天']

type QueryRowBase = Omit<
  QueryRow,
  'department' | 'priority' | 'processor' | 'source' | 'duration'
>

const queryRowsBase: QueryRowBase[] = [
  {
    id: 1,
    orderNo: 'QY-20260908-001',
    title: '华东区域销售数据同步',
    category: 'data-sync',
    applicant: '王晓敏',
    status: 'processing',
    updatedAt: '2026-09-08 10:26'
  },
  {
    id: 2,
    orderNo: 'QY-20260908-002',
    title: '8 月经营分析报表',
    category: 'report',
    applicant: '李晨',
    status: 'completed',
    updatedAt: '2026-09-08 09:42'
  },
  {
    id: 3,
    orderNo: 'QY-20260907-014',
    title: '供应链管理员权限复核',
    category: 'access-review',
    applicant: '周航',
    status: 'pending',
    updatedAt: '2026-09-07 17:18'
  },
  {
    id: 4,
    orderNo: 'QY-20260907-013',
    title: '门店库存明细导出',
    category: 'report',
    applicant: '陈璐',
    status: 'completed',
    updatedAt: '2026-09-07 16:03'
  },
  {
    id: 5,
    orderNo: 'QY-20260907-012',
    title: '客户主数据同步',
    category: 'data-sync',
    applicant: '赵博',
    status: 'failed',
    updatedAt: '2026-09-07 14:37'
  },
  {
    id: 6,
    orderNo: 'QY-20260907-011',
    title: '财务只读权限复核',
    category: 'access-review',
    applicant: '孙怡',
    status: 'completed',
    updatedAt: '2026-09-07 11:24'
  },
  {
    id: 7,
    orderNo: 'QY-20260906-009',
    title: '营销活动数据同步',
    category: 'data-sync',
    applicant: '郭洋',
    status: 'processing',
    updatedAt: '2026-09-06 18:09'
  },
  {
    id: 8,
    orderNo: 'QY-20260906-008',
    title: '区域费用报表导出',
    category: 'report',
    applicant: '马超',
    status: 'pending',
    updatedAt: '2026-09-06 15:46'
  },
  {
    id: 9,
    orderNo: 'QY-20260906-007',
    title: '销售目标达成率报表',
    category: 'report',
    applicant: '王晓敏',
    status: 'completed',
    updatedAt: '2026-09-06 13:22'
  },
  {
    id: 10,
    orderNo: 'QY-20260906-006',
    title: '华南区域客户主数据同步',
    category: 'data-sync',
    applicant: '李晨',
    status: 'processing',
    updatedAt: '2026-09-06 10:08'
  },
  {
    id: 11,
    orderNo: 'QY-20260905-012',
    title: '离职员工权限回收',
    category: 'access-review',
    applicant: '周航',
    status: 'completed',
    updatedAt: '2026-09-05 17:41'
  },
  {
    id: 12,
    orderNo: 'QY-20260905-011',
    title: '采购订单异常导出',
    category: 'report',
    applicant: '陈璐',
    status: 'failed',
    updatedAt: '2026-09-05 15:19'
  },
  {
    id: 13,
    orderNo: 'QY-20260905-010',
    title: '海外渠道数据同步',
    category: 'data-sync',
    applicant: '赵博',
    status: 'pending',
    updatedAt: '2026-09-05 13:56'
  },
  {
    id: 14,
    orderNo: 'QY-20260905-009',
    title: '应用管理员权限复核',
    category: 'access-review',
    applicant: '孙怡',
    status: 'processing',
    updatedAt: '2026-09-05 11:32'
  },
  {
    id: 15,
    orderNo: 'QY-20260905-008',
    title: '月度财务报表导出',
    category: 'report',
    applicant: '郭洋',
    status: 'completed',
    updatedAt: '2026-09-05 09:18'
  },
  {
    id: 16,
    orderNo: 'QY-20260904-015',
    title: '仓储库存数据同步',
    category: 'data-sync',
    applicant: '马超',
    status: 'completed',
    updatedAt: '2026-09-04 18:27'
  },
  {
    id: 17,
    orderNo: 'QY-20260904-014',
    title: '区域经营看板报表',
    category: 'report',
    applicant: '王晓敏',
    status: 'processing',
    updatedAt: '2026-09-04 16:45'
  },
  {
    id: 18,
    orderNo: 'QY-20260904-013',
    title: '研发环境权限复核',
    category: 'access-review',
    applicant: '李晨',
    status: 'pending',
    updatedAt: '2026-09-04 14:06'
  },
  {
    id: 19,
    orderNo: 'QY-20260904-012',
    title: '供应商档案数据同步',
    category: 'data-sync',
    applicant: '周航',
    status: 'completed',
    updatedAt: '2026-09-04 11:52'
  },
  {
    id: 20,
    orderNo: 'QY-20260904-011',
    title: '季度费用明细导出',
    category: 'report',
    applicant: '陈璐',
    status: 'failed',
    updatedAt: '2026-09-04 09:35'
  },
  {
    id: 21,
    orderNo: 'QY-20260903-010',
    title: '华北区域订单数据同步',
    category: 'data-sync',
    applicant: '赵博',
    status: 'processing',
    updatedAt: '2026-09-03 17:23'
  },
  {
    id: 22,
    orderNo: 'QY-20260903-009',
    title: '客服账号权限复核',
    category: 'access-review',
    applicant: '孙怡',
    status: 'completed',
    updatedAt: '2026-09-03 15:47'
  },
  {
    id: 23,
    orderNo: 'QY-20260903-008',
    title: '渠道转化率分析报表',
    category: 'report',
    applicant: '郭洋',
    status: 'completed',
    updatedAt: '2026-09-03 13:14'
  },
  {
    id: 24,
    orderNo: 'QY-20260903-007',
    title: '华中区域商品数据同步',
    category: 'data-sync',
    applicant: '马超',
    status: 'pending',
    updatedAt: '2026-09-03 10:28'
  },
  {
    id: 25,
    orderNo: 'QY-20260902-016',
    title: '外包人员权限复核',
    category: 'access-review',
    applicant: '王晓敏',
    status: 'processing',
    updatedAt: '2026-09-02 18:02'
  },
  {
    id: 26,
    orderNo: 'QY-20260902-015',
    title: '库存周转率报表导出',
    category: 'report',
    applicant: '李晨',
    status: 'completed',
    updatedAt: '2026-09-02 16:31'
  },
  {
    id: 27,
    orderNo: 'QY-20260902-014',
    title: '会员资料数据同步',
    category: 'data-sync',
    applicant: '周航',
    status: 'failed',
    updatedAt: '2026-09-02 14:26'
  },
  {
    id: 28,
    orderNo: 'QY-20260902-013',
    title: '数据平台访问权限复核',
    category: 'access-review',
    applicant: '陈璐',
    status: 'completed',
    updatedAt: '2026-09-02 11:09'
  },
  {
    id: 29,
    orderNo: 'QY-20260902-012',
    title: '门店销售日报导出',
    category: 'report',
    applicant: '赵博',
    status: 'processing',
    updatedAt: '2026-09-02 09:46'
  },
  {
    id: 30,
    orderNo: 'QY-20260901-011',
    title: '物流轨迹数据同步',
    category: 'data-sync',
    applicant: '孙怡',
    status: 'pending',
    updatedAt: '2026-09-01 17:52'
  },
  {
    id: 31,
    orderNo: 'QY-20260901-010',
    title: '人力成本分析报表',
    category: 'report',
    applicant: '郭洋',
    status: 'completed',
    updatedAt: '2026-09-01 15:38'
  },
  {
    id: 32,
    orderNo: 'QY-20260901-009',
    title: '财务系统角色权限复核',
    category: 'access-review',
    applicant: '马超',
    status: 'processing',
    updatedAt: '2026-09-01 13:05'
  },
  {
    id: 33,
    orderNo: 'QY-20260901-008',
    title: '商品价格数据同步',
    category: 'data-sync',
    applicant: '王晓敏',
    status: 'completed',
    updatedAt: '2026-09-01 10:17'
  },
  {
    id: 34,
    orderNo: 'QY-20260831-007',
    title: '客户活跃度趋势报表',
    category: 'report',
    applicant: '李晨',
    status: 'failed',
    updatedAt: '2026-08-31 18:16'
  },
  {
    id: 35,
    orderNo: 'QY-20260831-006',
    title: '营销账号权限复核',
    category: 'access-review',
    applicant: '周航',
    status: 'pending',
    updatedAt: '2026-08-31 16:42'
  },
  {
    id: 36,
    orderNo: 'QY-20260831-005',
    title: '区域库存数据同步',
    category: 'data-sync',
    applicant: '陈璐',
    status: 'processing',
    updatedAt: '2026-08-31 14:28'
  },
  {
    id: 37,
    orderNo: 'QY-20260831-004',
    title: '年度预算执行报表',
    category: 'report',
    applicant: '赵博',
    status: 'completed',
    updatedAt: '2026-08-31 11:36'
  },
  {
    id: 38,
    orderNo: 'QY-20260830-003',
    title: '测试环境权限复核',
    category: 'access-review',
    applicant: '孙怡',
    status: 'completed',
    updatedAt: '2026-08-30 17:04'
  },
  {
    id: 39,
    orderNo: 'QY-20260830-002',
    title: '供应链商品数据同步',
    category: 'data-sync',
    applicant: '郭洋',
    status: 'failed',
    updatedAt: '2026-08-30 13:48'
  },
  {
    id: 40,
    orderNo: 'QY-20260830-001',
    title: '重点客户经营分析报表',
    category: 'report',
    applicant: '马超',
    status: 'pending',
    updatedAt: '2026-08-30 09:27'
  }
]

export const queryRows: QueryRow[] = queryRowsBase.map((row, index) => ({
  ...row,
  department: queryDepartments[index % queryDepartments.length],
  priority: queryPriorities[index % queryPriorities.length],
  processor: queryProcessors[index % queryProcessors.length],
  source: querySources[index % querySources.length],
  duration: queryDurations[index % queryDurations.length]
}))

function getDateTimestamp(value?: string): number | undefined {
  if (!value) {
    return undefined
  }

  const timestamp = new Date(`${value}T00:00:00`).getTime()
  return Number.isNaN(timestamp) ? undefined : timestamp
}

export function queryRowsByFilters(filters: QueryFilters = {}): QueryResult {
  const keyword = filters.keyword?.trim().toLowerCase() ?? ''
  const title = filters.title?.trim().toLowerCase() ?? ''
  const startDate = getDateTimestamp(filters.startDate)
  const endDate = getDateTimestamp(filters.endDate)
  const endDateLimit = endDate === undefined ? undefined : endDate + 86_399_999

  const items = queryRows.filter((record) => {
    const recordTitle = record.title.toLowerCase()
    const applicant = record.applicant.toLowerCase()
    const matchesKeyword =
      !keyword ||
      record.orderNo.toLowerCase().includes(keyword) ||
      recordTitle.includes(keyword) ||
      applicant.includes(keyword)
    const matchesCategory =
      !filters.category ||
      filters.category === 'all' ||
      record.category === filters.category
    const matchesStatus =
      !filters.status || filters.status === 'all' || record.status === filters.status
    const matchesApplicant =
      !filters.applicant || record.applicant === filters.applicant
    const matchesTitle = !title || recordTitle.includes(title)
    const updatedAt = new Date(record.updatedAt.replace(' ', 'T')).getTime()
    const matchesDate =
      (startDate === undefined || updatedAt >= startDate) &&
      (endDateLimit === undefined || updatedAt <= endDateLimit)

    return (
      matchesKeyword &&
      matchesCategory &&
      matchesStatus &&
      matchesApplicant &&
      matchesTitle &&
      matchesDate
    )
  })

  return { items, total: items.length }
}
