import { DownloadOutlined, SearchOutlined } from '@ant-design/icons'
import {
  App as AntApp,
  Button,
  Card,
  Table,
  Tag,
  Typography
} from 'antd'
import type { TableColumnsType, TableProps, TableRef } from 'antd'
import { useCallback, useMemo, useRef, useState, type Key } from 'react'
import { queryVirtualData } from '@/api'
import {
  EllipsisParagraph,
  getTableHeaderSearchProps,
  QueryForm,
  TableContainer,
  TableToolbar,
  VirtualTable,
  type QueryFormField,
  type TableDensity
} from '@/components'
import { useTableColumns, useTablePagination, useTableQuery } from '@/hooks'
import type {
  QueryCategory,
  QueryPriority,
  QueryStatus,
  VirtualQueryHeaderFilterKey,
  VirtualQueryFilters,
  VirtualQueryRow
} from '@/pages/system/virtualQuery/data'

interface VirtualQueryFormValues {
  keyword?: string
  category?: QueryCategory | 'all'
  status?: QueryStatus | 'all'
  applicant?: string
}

interface VirtualQueryRequestValues extends VirtualQueryFormValues {
  orderNo?: string
  title?: string
  department?: string
  description?: string
  pageSize: number
  pageCurrent: number
}

const initialQueryValues: VirtualQueryRequestValues = {
  pageSize: 100,
  pageCurrent: 1
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

const virtualQueryHeaderFilterLabels: Record<
  VirtualQueryHeaderFilterKey,
  string
> = {
  orderNo: '查询单号',
  title: '业务标题',
  applicant: '申请人',
  department: '申请部门',
  description: '请求描述'
}

const applicantOptions = [
  '王晓敏',
  '李晨',
  '周航',
  '陈璐',
  '赵博',
  '孙怡',
  '郭洋',
  '马超'
].map((value) => ({ label: value, value }))

const virtualQueryFields: QueryFormField<VirtualQueryFormValues>[] = [
  {
    type: 'input',
    name: 'keyword',
    label: null,
    props: {
      allowClear: true,
      autoComplete: 'off',
      prefix: <SearchOutlined />,
      placeholder: '搜索单号、标题或申请人'
    }
  },
  {
    type: 'select',
    name: 'category',
    label: '业务类型',
    options: [
      { label: '全部', value: 'all' },
      ...Object.entries(categoryLabels).map(([value, label]) => ({
        label,
        value
      }))
    ],
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
        label,
        value
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
    options: applicantOptions,
    props: {
      allowClear: true,
      placeholder: '请选择申请人',
      showSearch: true,
      optionFilterProp: 'label'
    }
  }
]

function toVirtualQueryFilters(
  values: VirtualQueryRequestValues
): VirtualQueryFilters {
  return {
    keyword: values.keyword,
    category: values.category,
    status: values.status,
    orderNo: values.orderNo,
    title: values.title,
    applicant: values.applicant,
    department: values.department,
    description: values.description,
    pageSize: values.pageSize,
    pageCurrent: values.pageCurrent
  }
}

function renderCellText(value: string) {
  return (
    <span className="block truncate" title={value}>
      {value}
    </span>
  )
}

export default function VirtualQueryPage() {
  const { message } = AntApp.useApp()
  const [density, setDensity] = useState<TableDensity>('medium')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const tableRef = useRef<TableRef>(null)
  const queryRequest = useCallback(
    (values: VirtualQueryRequestValues, signal?: AbortSignal) =>
      queryVirtualData(toVirtualQueryFilters(values), signal),
    []
  )
  const handleQueryError = useCallback(
    (error: unknown) => {
      console.error('虚拟表格查询失败：', error)
      void message.error('查询失败，请稍后重试')
    },
    [message]
  )
  const handleView = useCallback(
    (record: VirtualQueryRow) => {
      void message.info(`虚拟数据第 ${record.sequence} 条：${record.orderNo}`)
    },
    [message]
  )
  const columns = useMemo<TableColumnsType<VirtualQueryRow>>(
    () => [
      {
        key: 'sequence',
        title: '序号',
        dataIndex: 'sequence',
        fixed: 'left',
        width: 88,
        align: 'center'
      },
      {
        key: 'orderNo',
        title: '查询单号',
        dataIndex: 'orderNo',
        fixed: 'left',
        width: 190,
        render: (value: string) => renderCellText(value)
      },
      {
        key: 'title',
        title: '业务标题',
        dataIndex: 'title',
        width: 280,
        align: 'center',
        render: (value: string) => renderCellText(value)
      },
      {
        key: 'category',
        title: '业务类型',
        dataIndex: 'category',
        width: 120,
        align: 'center',
        render: (value: QueryCategory) => categoryLabels[value]
      },
      {
        key: 'applicant',
        title: '申请人',
        dataIndex: 'applicant',
        width: 120,
        align: 'center'
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
        render: (value: QueryPriority) => (
          <Tag color={priorityColors[value]}>{priorityLabels[value]}</Tag>
        )
      },
      {
        key: 'status',
        title: '处理状态',
        dataIndex: 'status',
        width: 120,
        align: 'center',
        render: (value: QueryStatus) => (
          <Tag color={statusColors[value]}>{statusLabels[value]}</Tag>
        )
      },
      {
        key: 'description',
        title: '请求描述',
        dataIndex: 'description',
        align: 'center',
        render: (remark: string) => (
          <EllipsisParagraph  tooltip={remark}>
            {remark}
          </EllipsisParagraph>
        )
      },
      {
        key: 'updatedAt',
        title: '更新时间',
        dataIndex: 'updatedAt',
        width: 180,
        align: 'center'
      },
      {
        key: 'actions',
        title: '操作',
        fixed: 'right',
        width: 90,
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
  } = useTableColumns<VirtualQueryRow>({ columns })
  const rowSelection = useMemo<
    TableProps<VirtualQueryRow>['rowSelection']
  >(
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
  } = useTableQuery<VirtualQueryRequestValues, VirtualQueryRow>({
    initialData: [],
    initialValues: initialQueryValues,
    query: queryRequest,
    onError: handleQueryError
  })
  const renderSummary = useCallback(
    (pageData: readonly VirtualQueryRow[]) => {
      const statusCounts: Record<QueryStatus, number> = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0
      }

      pageData.forEach((record) => {
        statusCounts[record.status] += 1
      })

      return (
        <Table.Summary fixed>
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={tableColumns.length + 1}>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                <Typography.Text strong>
                  本页合计 {pageData.length} 条
                </Typography.Text>
                <Typography.Text type="secondary">
                  待处理 {statusCounts.pending} 条
                </Typography.Text>
                <Typography.Text type="secondary">
                  处理中 {statusCounts.processing} 条
                </Typography.Text>
                <Typography.Text type="secondary">
                  已完成 {statusCounts.completed} 条
                </Typography.Text>
                <Typography.Text type="secondary">
                  处理失败 {statusCounts.failed} 条
                </Typography.Text>
                <Typography.Text type="secondary">
                  已选 {selectedRowKeys.length} 条
                </Typography.Text>
              </div>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>
      )
    },
    [selectedRowKeys.length, tableColumns.length]
  )
  const { pagination, pageSize, resetPagination } = useTablePagination({
    total,
    defaultPageCurrent: initialQueryValues.pageCurrent,
    defaultPageSize: initialQueryValues.pageSize,
    pageSizeOptions: [50, 100, 200, 500],
    onChange: (page, nextPageSize) => {
      void runQuery({
        ...initialQueryValues,
        ...lastValues,
        pageCurrent: page,
        pageSize: nextPageSize
      })
    }
  })
  const handleHeaderFilterChange = useCallback(
    (key: VirtualQueryHeaderFilterKey, value?: string) => {
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

        if (!Object.hasOwn(virtualQueryHeaderFilterLabels, columnKey)) {
          return column
        }

        const filterKey = columnKey as VirtualQueryHeaderFilterKey

        return {
          ...column,
          ...getTableHeaderSearchProps<VirtualQueryRow>({
            loading,
            placeholder: `请输入${virtualQueryHeaderFilterLabels[filterKey]}`,
            value: lastValues[filterKey],
            onChange: (value) => handleHeaderFilterChange(filterKey, value)
          })
        }
      }),
    [handleHeaderFilterChange, lastValues, loading, tableColumns]
  )

  function handleQuery(values: VirtualQueryFormValues) {
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

  function handleScrollToRow() {
    const targetIndex = Math.min(99, dataSource.length - 1)

    if (targetIndex < 0) {
      return
    }

    tableRef.current?.scrollTo({ index: targetIndex, align: 'start' })
    void message.info(`已定位到当前页第 ${targetIndex + 1} 行`)
  }

  function handleExport() {
    const exportColumns: Array<{
      key: keyof VirtualQueryRow
      title: string
    }> = [
      { key: 'sequence', title: '序号' },
      { key: 'orderNo', title: '查询单号' },
      { key: 'title', title: '业务标题' },
      { key: 'category', title: '业务类型' },
      { key: 'applicant', title: '申请人' },
      { key: 'status', title: '处理状态' },
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
    anchor.download = `虚拟查询结果-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    void message.success(`已导出 ${dataSource.length} 条数据`)
  }

  return (
    <main className="flex h-full min-h-0 w-full flex-col gap-4">
      <Card size="small" className="shrink-0">
        <QueryForm<VirtualQueryFormValues>
          fields={virtualQueryFields}
          loading={loading}
          name="virtual-data-query"
          onFinish={handleQuery}
          onReset={handleReset}
          initialValues={{ category: 'all', status: 'all' }}
        />
      </Card>

      <TableContainer
        title={
          <TableToolbar
            title="虚拟数据列表"
            actions={
              <>
                <Button
                  disabled={dataSource.length < 100}
                  onClick={handleScrollToRow}
                >
                  定位当前页第 100 行
                </Button>
                <Button icon={<DownloadOutlined />} onClick={handleExport}>
                  导出当前页
                </Button>
              </>
            }
            extra={
              <Typography.Text type="secondary">
                共 {total.toLocaleString()} 条 · 已启用虚拟滚动
              </Typography.Text>
            }
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
        <VirtualTable<VirtualQueryRow>
          ref={tableRef}
          rowKey="id"
          columns={resolvedTableColumns}
          dataSource={dataSource}
          loading={loading}
          rowSelection={rowSelection}
          summary={renderSummary}
          size={density}
          bordered
          pagination={pagination}
          scroll={{ x: tableScrollX }}
        />
      </TableContainer>
    </main>
  )
}
