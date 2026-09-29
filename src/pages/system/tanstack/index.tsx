import { DownloadOutlined, SearchOutlined } from '@ant-design/icons'
import { App as AntApp, Button, Card, Tag, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { memo, useCallback, useMemo, useState, type Key } from 'react'
import { queryVirtualData } from '@/api'
import { QueryContainer } from '@/components/queryContainer'
import { QueryForm } from '@/components/queryForm'
import type { QueryFormField } from '@/components/queryForm'
import { TableContainer } from '@/components/tableContainer'
import { TableToolbar } from '@/components/tableToolbar'
import type { TableColumnSetting } from '@/components/tableToolbar'
import { TanstackTable } from '@/components/tanstackTable'
import type { TanstackColumn } from '@/components/tanstackTable'
import { useTablePagination, useTableQuery, useTableSettings } from '@/hooks'
import type {
  QueryCategory,
  QueryPriority,
  QueryStatus,
  VirtualQueryHeaderFilterKey,
  VirtualQueryFilters,
  VirtualQueryRow
} from '@/pages/system/virtualQuery/data'
import { EllipsisParagraph } from '@/components/ellipsisParagraph'

interface QueryValues {
  keyword?: string
  category?: QueryCategory | 'all'
  status?: QueryStatus | 'all'
  applicant?: string
}

interface RequestValues extends QueryValues {
  orderNo?: string
  title?: string
  department?: string
  description?: string
  pageCurrent: number
  pageSize: number
}

const initialValues: RequestValues = { pageCurrent: 1, pageSize: 100 }
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
const priorityLabels: Record<QueryPriority, string> = { high: '高', medium: '中', low: '低' }
const priorityColors: Record<QueryPriority, string> = { high: 'error', medium: 'warning', low: 'default' }
const EXPORT_KEYS: Array<keyof VirtualQueryRow> = ['sequence', 'orderNo', 'title', 'category', 'applicant', 'status', 'updatedAt']
const applicantOptions = ['王晓敏', '李晨', '周航', '陈璐', '赵博', '孙怡', '郭洋', '马超']
  .map((value) => ({ label: value, value }))

function escapeCsvCell(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

const fields: QueryFormField<QueryValues>[] = [
  {
    type: 'input',
    name: 'keyword',
    label: null,
    props: { allowClear: true, autoComplete: 'off', prefix: <SearchOutlined />, placeholder: '搜索单号、标题或申请人' }
  },
  {
    type: 'select',
    name: 'category',
    label: '业务类型',
    options: [{ label: '全部', value: 'all' }, ...Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))],
    props: { placeholder: '请选择业务类型' }
  },
  {
    type: 'select',
    name: 'status',
    label: '处理状态',
    options: [{ label: '全部', value: 'all' }, ...Object.entries(statusLabels).map(([value, label]) => ({ value, label }))],
    props: { placeholder: '请选择处理状态' }
  },
  {
    type: 'select',
    name: 'applicant',
    label: '申请人',
    options: applicantOptions,
    props: { allowClear: true, placeholder: '请选择申请人', showSearch: true, optionFilterProp: 'label' }
  }
]

function TanstackPage() {
  const { message } = AntApp.useApp()
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const getRowKey = useCallback((row: VirtualQueryRow) => row.id, [])
  const query = useCallback((values: RequestValues, signal?: AbortSignal) =>
    queryVirtualData(values as VirtualQueryFilters, signal), [])
  const onError = useCallback((error: unknown) => {
    console.error('TanStack 表格查询失败：', error)
    void message.error('查询失败，请稍后重试')
  }, [message])
  const { dataSource, total, loading, lastValues, runQuery, refresh } = useTableQuery<RequestValues, VirtualQueryRow>({
    initialData: [],
    initialValues,
    query,
    onError
  })
  const { pagination, pageSize, resetPagination } = useTablePagination({
    total,
    defaultPageCurrent: 1,
    defaultPageSize: 100,
    pageSizeOptions: [10, 50, 100, 200, 500],
    onChange: (pageCurrent, nextPageSize) => {
      void runQuery({ ...initialValues, ...lastValues, pageCurrent, pageSize: nextPageSize })
    }
  })
  const handleHeaderSearch = useCallback((key: VirtualQueryHeaderFilterKey, value?: string) => {
    resetPagination()
    void runQuery({ ...lastValues, [key]: value, pageCurrent: 1, pageSize })
  }, [lastValues, pageSize, resetPagination, runQuery])
  const columns = useMemo<TanstackColumn<VirtualQueryRow>[]>(() => [
    { key: 'sequence', title: '序号', width: 88, align: 'center', fixed: 'left', sortable: true },
    { key: 'orderNo', title: '查询单号', width: 190, fixed: 'left', search: { value: lastValues.orderNo, onChange: (value) => handleHeaderSearch('orderNo', value) } },
    { key: 'title', title: '业务标题', width: 280, align: 'center', search: { value: lastValues.title, onChange: (value) => handleHeaderSearch('title', value) } },
    { key: 'category', title: '业务类型', width: 120, align: 'center', render: (value) => categoryLabels[value as QueryCategory] },
    { key: 'applicant', title: '申请人', width: 120, align: 'center', search: { value: lastValues.applicant, onChange: (value) => handleHeaderSearch('applicant', value) } },
    { key: 'department', title: '申请部门', width: 140, align: 'center', search: { value: lastValues.department, onChange: (value) => handleHeaderSearch('department', value) } },
    { key: 'priority', title: '优先级', width: 100, align: 'center', render: (value) => <Tag color={priorityColors[value as QueryPriority]}>{priorityLabels[value as QueryPriority]}</Tag> },
    { key: 'status', title: '处理状态', width: 120, align: 'center', render: (value) => <Tag color={statusColors[value as QueryStatus]}>{statusLabels[value as QueryStatus]}</Tag> },
    { key: 'description', title: '请求描述', width: 320, align: 'center', search: { value: lastValues.description, onChange: (value) => handleHeaderSearch('description', value) }, render: (value) => <EllipsisParagraph tooltip={value}>{value}</EllipsisParagraph> },
    { key: 'updatedAt', title: '更新时间', width: 180, align: 'center', sortable: true },
    { key: 'id', title: '操作', width: 90, align: 'center', fixed: 'right', resizable: false, hideable: false, render: (_value, row) => <Button type="link" size="small" onClick={() => void message.info(`虚拟数据第 ${row.sequence} 条：${row.orderNo}`)}>查看</Button> }
  ], [handleHeaderSearch, lastValues, message])
  const settingsColumns = useMemo<TableColumnsType<VirtualQueryRow>>(() => columns.map((column) => ({
    key: column.key,
    title: column.title,
    dataIndex: column.key,
    width: column.width,
    fixed: column.fixed || undefined
  })), [columns])
  const defaultColumnSettings = useMemo<TableColumnSetting[]>(() => columns.map((column) => ({
    key: column.key,
    label: column.title,
    visible: true,
    fixed: column.fixed ?? false,
    width: column.width,
    disabled: column.hideable === false
  })), [columns])
  const tableSettings = useTableSettings<VirtualQueryRow>({
    columns: settingsColumns,
    defaultSettings: defaultColumnSettings
  })
  const statusCounts = useMemo(() => ({
    pending: dataSource.filter((row) => row.status === 'pending').length,
    processing: dataSource.filter((row) => row.status === 'processing').length,
    completed: dataSource.filter((row) => row.status === 'completed').length,
    failed: dataSource.filter((row) => row.status === 'failed').length
  }), [dataSource])

  function handleExport() {
    const lines = [EXPORT_KEYS.join(','), ...dataSource.map((row) => EXPORT_KEYS.map((key) => escapeCsvCell(row[key])).join(','))]
    const url = URL.createObjectURL(new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `TanStack查询结果-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    void message.success(`已导出 ${dataSource.length} 条数据`)
  }

  return (
    <QueryContainer>
      <Card size="small" className="shrink-0">
        <QueryForm<QueryValues>
          fields={fields}
          loading={loading}
          name="tanstack-data-query"
          initialValues={{ category: 'all', status: 'all' }}
          onFinish={(values) => {
            resetPagination()
            void runQuery({ ...lastValues, ...values, pageCurrent: 1, pageSize })
          }}
          onReset={() => {
            resetPagination()
            void runQuery({ pageCurrent: 1, pageSize })
          }}
        />
      </Card>
      <TableContainer title={<TableToolbar
        {...tableSettings.toolbarProps}
        title="TanStack 数据列表"
        actions={<Button icon={<DownloadOutlined />} onClick={handleExport}>导出当前页</Button>}
        extra={<Typography.Text type="secondary">共 {total.toLocaleString()} 条 · TanStack Table</Typography.Text>}
        onRefresh={() => { void refresh() }}
        refreshing={loading}
      />}>
        <TanstackTable
          columns={columns}
          dataSource={dataSource}
          rowKey={getRowKey}
          loading={loading}
          virtualize
          size={tableSettings.density === 'medium' ? 'middle' : tableSettings.density}
          columnSettings={tableSettings.columnSettings}
          onColumnSettingsChange={tableSettings.onColumnSettingsChange}
          pagination={pagination}
          rowSelection={{ type: 'checkbox', selectedRowKeys, onChange: setSelectedRowKeys }}
          summary={<div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <Typography.Text strong>本页合计 {dataSource.length} 条</Typography.Text>
            <Typography.Text type="secondary">待处理 {statusCounts.pending} 条</Typography.Text>
            <Typography.Text type="secondary">处理中 {statusCounts.processing} 条</Typography.Text>
            <Typography.Text type="secondary">已完成 {statusCounts.completed} 条</Typography.Text>
            <Typography.Text type="secondary">处理失败 {statusCounts.failed} 条</Typography.Text>
            <Typography.Text type="secondary">已选 {selectedRowKeys.length} 条</Typography.Text>
          </div>}
        />
      </TableContainer>
    </QueryContainer>
  )
}

export default memo(TanstackPage)
