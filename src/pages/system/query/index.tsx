import {
  DownloadOutlined,
  FileSearchOutlined,
  PlusOutlined
} from '@ant-design/icons'
import {
  App as AntApp,
  Button,
  Card,
  Input,
  Tag,
  Typography
} from 'antd'
import type { TableColumnsType, TableProps } from 'antd'
import { useCallback, useMemo, useState, type Key } from 'react'
import { useSearchParams } from 'react-router-dom'
import { queryData } from '@/api'
import { AutoHeightTable } from '@/components/autoHeightTable'
import { EllipsisParagraph } from '@/components/ellipsisParagraph'
import { QueryForm } from '@/components/queryForm'
import type { QueryDateRangeValue, QueryFormField } from '@/components/queryForm'
import { getTableHeaderSearchProps } from '@/components/tableHeaderSearch'
import { TableContainer } from '@/components/tableContainer'
import { TableToolbar } from '@/components/tableToolbar'
import type { TableDensity } from '@/components/tableToolbar'
import {
  useTableColumns,
  useTablePagination,
  useTableQuery
} from '@/hooks'
import {
  type QueryCategory,
  type QueryFilters,
  type QueryHeaderFilterKey,
  type QueryPriority,
  type QueryRow,
  type QueryStatus
} from '@/pages/system/query/data'

interface QueryFormValues {
  keyword?: string
  category?: QueryCategory | 'all'
  status?: QueryStatus | 'all'
  applicant?: string
  title?: string
  updatedAt?: QueryDateRangeValue
}

interface QueryRequestValues extends QueryFormValues {
  orderNo?: string
  requestId?: string
  description?: string
  remark?: string
  department?: string
  processor?: string
  pageSize: number
  pageCurrent: number
}

const categoryLabels: Record<QueryCategory, string> = {
  'data-sync': '数据同步',
  report: '报表导出',
  'access-review': '权限复核'
}

const statusLabels: Record<QueryStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  failed: '处理失败'
}

const statusColors: Record<QueryStatus, string> = {
  pending: 'default',
  processing: 'processing',
  completed: 'success',
  failed: 'error'
}

const priorityLabels: Record<QueryPriority, string> = {
  high: '高',
  medium: '中',
  low: '低'
}

const priorityColors: Record<QueryPriority, string> = {
  high: 'error',
  medium: 'warning',
  low: 'default'
}

const queryHeaderFilterLabels: Record<QueryHeaderFilterKey, string> = {
  orderNo: '查询单号',
  requestId: '请求标识',
  description: '请求描述',
  remark: '处理备注',
  applicant: '申请人',
  department: '申请部门',
  processor: '处理人'
}

const applicantOptions = [
  { label: '王晓敏', value: '王晓敏' },
  { label: '李晨', value: '李晨' },
  { label: '周航', value: '周航' },
  { label: '陈璐', value: '陈璐' },
  { label: '赵博', value: '赵博' },
  { label: '孙怡', value: '孙怡' },
  { label: '郭洋', value: '郭洋' },
  { label: '马超', value: '马超' }
]

function requestApplicantOptions() {
  return Promise.resolve(applicantOptions)
}

const queryFields: QueryFormField<QueryFormValues>[] = [
  {
    type: 'input',
    name: 'keyword',
    label: null,
    props: {
      placeholder: '查询单号、标题或申请人',
      autoComplete: 'off'
    }
  },
  {
    type: 'select',
    name: 'category',
    label: '业务类型',
    options: [
      { label: '全部', value: 'all' },
      ...Object.entries(categoryLabels).map(([value, label]) => ({
        value,
        label
      }))
    ],
    formItemProps: {
      tooltip: '选择业务类型后，查询结果将被过滤'
    },
    props: {
      placeholder: '请选择业务类型'
    }
  },
  {
    type: 'select',
    name: 'status',
    label: '处理状态',
    options: [
      { label: '全部', value: 'all' },
      ...Object.entries(statusLabels).map(([value, label]) => ({
        value,
        label
      }))
    ],
    props: {
      placeholder: '请选择处理状态'
    }
  },
  {
    type: 'select',
    name: 'applicant',
    label: '申请人',
    requestOptions: requestApplicantOptions,
    props: {
      placeholder: '展开列表时动态加载',
      showSearch: true,
      optionFilterProp: 'label'
    }
  },
  {
    type: 'custom',
    name: 'title',
    label: '业务标题',
    render: () => (
      <Input
        allowClear
        prefix={<FileSearchOutlined />}
        placeholder="自定义组件渲染"
      />
    )
  },
  {
    type: 'dateRange',
    name: 'updatedAt',
    label: '更新时间',
    props: {
      allowClear: true,
      placeholder: ['开始日期', '结束日期']
    }
  }
]

const initialQueryValues: QueryRequestValues = {
  pageSize: 20,
  pageCurrent: 1
}

function toQueryFilters(values: QueryRequestValues): QueryFilters {
  const [startDate, endDate] = values.updatedAt ?? []

  return {
    keyword: values.keyword,
    category: values.category,
    status: values.status,
    orderNo: values.orderNo,
    requestId: values.requestId,
    description: values.description,
    remark: values.remark,
    applicant: values.applicant,
    department: values.department,
    processor: values.processor,
    title: values.title,
    startDate: startDate?.format('YYYY-MM-DD'),
    endDate: endDate?.format('YYYY-MM-DD'),
    pageSize: values.pageSize,
    pageCurrent: values.pageCurrent
  }
}

export default function QueryPage() {
  const { message } = AntApp.useApp()
  const [density, setDensity] = useState<TableDensity>('medium')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [, setSearchParams] = useSearchParams()
  const queryRequest = useCallback(
    (values: QueryRequestValues, signal?: AbortSignal) =>
      queryData(toQueryFilters(values), signal),
    []
  )
  const handleQueryError = useCallback(
    (error: unknown) => {
      console.error('查询失败：', error)
      void message.error('查询失败，请稍后重试')
    },
    [message]
  )
  const handleView = useCallback(
    (record: QueryRow) => {
      void message.info(`查询单号：${record.orderNo}`)
    },
    [message]
  )
  const columns = useMemo<TableColumnsType<QueryRow>>(
    () => [
      {
        key: 'orderNo',
        title: '查询单号',
        dataIndex: 'orderNo',
        width: 230,
        align: 'center',
        render: (orderNo: string, record) => (
          <div className="min-w-0">
            <EllipsisParagraph strong tooltip={orderNo}>
              {orderNo}
            </EllipsisParagraph>
            <EllipsisParagraph
              type="secondary"
              tooltip={record.title}
            >
              {record.title}
            </EllipsisParagraph>
          </div>
        )
      },
      {
        key: 'requestId',
        title: '请求标识',
        dataIndex: 'requestId',
        width: 280,
        align: 'center',
        render: (requestId: string) => (
          <EllipsisParagraph rows={2} tooltip={requestId}>
            {requestId}
          </EllipsisParagraph>
        )
      },
      {
        key: 'description',
        title: '请求描述',
        dataIndex: 'description',
        width: 320,
        align: 'center',
        render: (description: string) => (
          <EllipsisParagraph tooltip={description}>
            {description}
          </EllipsisParagraph>
        )
      },
      {
        key: 'remark',
        title: '处理备注',
        dataIndex: 'remark',
        width: 280,
        align: 'center',
        render: (remark: string) => (
          <EllipsisParagraph  tooltip={remark}>
            {remark}
          </EllipsisParagraph>
        )
      },
      {
        key: 'category',
        title: '业务类型',
        dataIndex: 'category',
        width: 140,
        align: 'center',
        render: (category: QueryCategory) => categoryLabels[category]
      },
      {
        key: 'department',
        title: '申请部门',
        dataIndex: 'department',
        width: 140,
        align: 'center'
      },
      {
        key: 'priority',
        title: '优先级',
        dataIndex: 'priority',
        width: 100,
        align: 'center',
        render: (priority: QueryPriority) => (
          <Tag color={priorityColors[priority]}>{priorityLabels[priority]}</Tag>
        )
      },
      {
        key: 'applicant',
        title: '申请人',
        dataIndex: 'applicant',
        width: 120,
        align: 'center'
      },
      {
        key: 'processor',
        title: '处理人',
        dataIndex: 'processor',
        width: 120,
        align: 'center'
      },
      {
        key: 'status',
        title: '处理状态',
        dataIndex: 'status',
        width: 120,
        align: 'center',
        render: (status: QueryStatus) => (
          <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
        )
      },
      // {
      //   key: 'updatedAt',
      //   title: '更新时间',
      //   dataIndex: 'updatedAt',
      //   align: 'center',
      //   width: 180
      // },
      // {
      //   key: 'duration',
      //   title: '处理耗时',
      //   dataIndex: 'duration',
      //   align: 'center',
      //   width: 160
      // },
      {
        key: 'actions',
        title: '操作',
        width: 100,
        fixed: 'right',
        align: 'center',
        render: (_value, record) => (
          <Button type="link" size="small" onClick={() => handleView(record)}>
            查看
          </Button>
        )
      }
    ],
    [handleView]
  )
  const {
    columnSettings,
    tableColumns,
    tableScrollX,
    onColumnSettingsChange,
    resetColumnSettings
  } = useTableColumns<QueryRow>({
    columns
  })
  const rowSelection = useMemo<TableProps<QueryRow>['rowSelection']>(
    () => ({
      align: 'center',
      fixed: true,
      preserveSelectedRowKeys: true,
      selectedRowKeys,
      type: 'checkbox',
      onChange: (nextSelectedRowKeys) => {
        setSelectedRowKeys(nextSelectedRowKeys)
      }
    }),
    [selectedRowKeys]
  )
  const {
    dataSource,
    total,
    loading,
    lastValues,
    runQuery,
    refresh
  } = useTableQuery<
    QueryRequestValues,
    QueryRow
  >({
    initialData: [],
    initialValues: initialQueryValues,
    query: queryRequest,
    onError: handleQueryError
  })
  const { pagination, pageSize, resetPagination } = useTablePagination({
    total,
    defaultPageCurrent: 1,
    defaultPageSize: 20,
    onChange: (page, nextPageSize) => {
      void runQuery({
        ...lastValues,
        pageCurrent: page,
        pageSize: nextPageSize
      })
    }
  })
  const handleHeaderFilterChange = useCallback(
    (key: QueryHeaderFilterKey, value?: string) => {
      const nextValues = { ...lastValues, [key]: value }

      if (!value) {
        delete nextValues[key]
      }

      resetPagination()
      void runQuery({
        ...nextValues,
        pageCurrent: 1,
        pageSize
      })
    },
    [lastValues, pageSize, resetPagination, runQuery]
  )
  const resolvedTableColumns = useMemo(
    () =>
      tableColumns.map((column) => {
        const columnKey = String(column.key ?? '')

        if (!Object.hasOwn(queryHeaderFilterLabels, columnKey)) {
          return column
        }

        const filterKey = columnKey as QueryHeaderFilterKey

        return {
          ...column,
          ...getTableHeaderSearchProps<QueryRow>({
            loading,
            placeholder: `请输入${queryHeaderFilterLabels[filterKey]}`,
            value: lastValues[filterKey],
            onChange: (value) => handleHeaderFilterChange(filterKey, value)
          })
        }
      }),
    [handleHeaderFilterChange, lastValues, loading, tableColumns]
  )

  function handleQuery(values: QueryFormValues) {
    resetPagination()
    void runQuery({
      ...lastValues,
      ...values,
      pageCurrent: 1,
      pageSize
    })
  }

  function handleReset() {
    resetPagination()
    void runQuery({
      pageCurrent: 1,
      pageSize
    })
  }

  function handleCreate() {
    void message.info('新增功能待接入')
  }

  function handleChangeQuery() {
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams)
        nextParams.set('changed', new Date() + '')
        return nextParams
      },
      { replace: true }
    )
  }

  function handleExport() {
    const exportColumns: Array<{ key: keyof QueryRow; title: string }> = [
      { key: 'orderNo', title: '查询单号' },
      { key: 'title', title: '业务标题' },
      { key: 'requestId', title: '请求标识' },
      { key: 'description', title: '请求描述' },
      { key: 'remark', title: '处理备注' },
      { key: 'category', title: '业务类型' },
      { key: 'applicant', title: '申请人' },
      { key: 'department', title: '申请部门' },
      { key: 'priority', title: '优先级' },
      { key: 'processor', title: '处理人' },
      { key: 'status', title: '处理状态' },
      { key: 'source', title: '提交来源' },
      { key: 'duration', title: '处理耗时' },
      { key: 'updatedAt', title: '更新时间' }
    ]
    const escapeCell = (value: unknown) =>
      `"${String(value ?? '').replaceAll('"', '""')}"`
    const lines = [
      exportColumns.map((column) => escapeCell(column.title)).join(','),
      ...dataSource.map((row) =>
        exportColumns.map((column) => escapeCell(row[column.key])).join(',')
      )
    ]
    const blob = new Blob([`\uFEFF${lines.join('\r\n')}`], {
      type: 'text/csv;charset=utf-8'
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `查询结果-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    void message.success(`已导出 ${dataSource.length} 条数据`)
  }

  return (
    <main className="flex h-full min-h-0 w-full flex-col gap-4">
      <Card size="small" className="shrink-0">
        <QueryForm<QueryFormValues>
          fields={queryFields}
          loading={loading}
          name="data-query"
          onFinish={handleQuery}
          onReset={handleReset}
          initialValues={{ status: 'all', applicant: '李晨' }}
        />
      </Card>

      <TableContainer
        title={
          <TableToolbar
            actions={
              <>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  新增
                </Button>
                <Button icon={<DownloadOutlined />} onClick={handleExport}>
                  导出
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleChangeQuery}
                >
                  改变参数
                </Button>
              </>
            }
            extra={<Typography.Text type="secondary">共 {total} 条</Typography.Text>}
            onRefresh={() => {
              void refresh()
            }}
            refreshing={loading}
            density={density}
            onDensityChange={setDensity}
            columnSettings={columnSettings}
            onColumnSettingsChange={onColumnSettingsChange}
            onColumnSettingsReset={resetColumnSettings}
          />
        }
      >
        <AutoHeightTable<QueryRow>
          rowKey="id"
          tableLayout="fixed"
          smoothSidebarResize
          columns={resolvedTableColumns}
          dataSource={dataSource}
          loading={loading}
          rowSelection={rowSelection}
          size={density}
          pagination={pagination}
          scroll={{ x: tableScrollX }}
        />
      </TableContainer>
    </main>
  )
}
