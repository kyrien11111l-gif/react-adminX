import { SearchOutlined } from '@ant-design/icons'
import {
  App as AntApp,
  Button,
  Card,
  Table,
  Tag,
  Typography
} from 'antd'
import type { TableColumnsType, TableProps } from 'antd'
import {
  useCallback,
  useMemo,
  useState,
  type Key
} from 'react'
import { queryVirtualData } from '@/api'
import { EllipsisParagraph } from '@/components/ellipsisParagraph'
import { QueryContainer } from '@/components/queryContainer'
import { QueryForm } from '@/components/queryForm'
import type { QueryFormField } from '@/components/queryForm'
import { getTableHeaderSearchProps } from '@/components/tableHeaderSearch'
import { TableToolbar } from '@/components/tableToolbar'
import { useTablePagination, useTableQuery, useTableSettings } from '@/hooks'
import type {
  QueryCategory,
  QueryPriority,
  QueryStatus,
  VirtualQueryFilters,
  VirtualQueryHeaderFilterKey,
  VirtualQueryRow
} from '@/pages/system/virtualQuery/data'

const SELECTION_COLUMN_WIDTH = 50
const TABLE_SCROLL_X = 1798
const TABLE_SCROLL_Y = 480

type NativeTableFormValues = Pick<
  VirtualQueryFilters,
  'keyword' | 'category' | 'status' | 'applicant'
>

type NativeTableRequestValues = Omit<
  VirtualQueryFilters,
  'pageSize' | 'pageCurrent'
> & {
  pageSize: number
  pageCurrent: number
}

const initialQueryValues: NativeTableRequestValues = {
  pageSize: 10,
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

const headerFilterLabels: Record<VirtualQueryHeaderFilterKey, string> = {
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

const queryFields: QueryFormField<NativeTableFormValues>[] = [
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

function renderCellText(value: string) {
  return (
    <span className="block truncate" title={value}>
      {value}
    </span>
  )
}

function shouldCellUpdate(
  record: VirtualQueryRow,
  previousRecord: VirtualQueryRow
) {
  return record !== previousRecord
}

export default function NativeTablePage() {
  const { message } = AntApp.useApp()
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const tableSettings = useTableSettings()
  const queryRequest = useCallback(
    (values: NativeTableRequestValues, signal?: AbortSignal) =>
      queryVirtualData(values, signal),
    []
  )
  const handleQueryError = useCallback(
    (error: unknown) => {
      console.error('原生表格页查询失败：', error)
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
        render: (value: string) => renderCellText(value)
      },
      {
        key: 'title',
        title: '业务标题',
        dataIndex: 'title',
        width: 280,
        align: 'center',
        render: (value: string) => (
          <EllipsisParagraph tooltip={value}>{value}</EllipsisParagraph>
        )
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
        width: 140,
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
        width: 300,
        align: 'center'
        // render: (value: string) => (
        //   <EllipsisParagraph tooltip={value}>{value}</EllipsisParagraph>
        // )
      },
      {
        key: 'updatedAt',
        title: '更新时间',
        dataIndex: 'updatedAt',
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
  const rowSelection = useMemo<TableProps<VirtualQueryRow>['rowSelection']>(
    () => ({
      align: 'center',
      columnWidth: SELECTION_COLUMN_WIDTH,
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
  } = useTableQuery<NativeTableRequestValues, VirtualQueryRow>({
    initialData: [],
    initialValues: initialQueryValues,
    query: queryRequest,
    onError: handleQueryError
  })
  const { pagination, pageSize, resetPagination } = useTablePagination({
    total,
    defaultPageCurrent: initialQueryValues.pageCurrent,
    defaultPageSize: initialQueryValues.pageSize,
    pageSizeOptions: [10, 20, 50, 100, 200],
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
      columns.map((column) => {
        const columnKey = String(column.key ?? '')
        const optimizedColumn = { ...column, shouldCellUpdate }

        if (!Object.hasOwn(headerFilterLabels, columnKey)) {
          return optimizedColumn
        }

        const filterKey = columnKey as VirtualQueryHeaderFilterKey

        return {
          ...optimizedColumn,
          ...getTableHeaderSearchProps<VirtualQueryRow>({
            loading,
            placeholder: `请输入${headerFilterLabels[filterKey]}`,
            value: lastValues[filterKey],
            onChange: (value) => handleHeaderFilterChange(filterKey, value)
          })
        }
      }),
    [columns, handleHeaderFilterChange, lastValues, loading]
  )

  // 暂时停用 ResizeObserver 动态测量，使用固定的表格纵向滚动高度。

  function handleQuery(values: NativeTableFormValues) {
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

  return (
    <QueryContainer>
      <Card size="small" className="shrink-0">
        <QueryForm<NativeTableFormValues>
          fields={queryFields}
          loading={loading}
          name="native-table-query"
          onFinish={handleQuery}
          onReset={handleReset}
          initialValues={{ category: 'all', status: 'all' }}
        />
      </Card>

<TableToolbar
            {...tableSettings.toolbarProps}
            title="原生表格数据"
            extra={
              <Typography.Text type="secondary">
                共 {total.toLocaleString()} 条
              </Typography.Text>
            }
            onRefresh={() => {
              void refresh()
            }}
            refreshing={loading}
          />

          <Table<VirtualQueryRow>
          rowKey="id"
          tableLayout="fixed"
          columns={resolvedTableColumns}
          dataSource={dataSource}
          loading={loading}
          rowSelection={rowSelection}
          size={tableSettings.density}
          bordered
          pagination={pagination}
          scroll={{ x: TABLE_SCROLL_X, y: TABLE_SCROLL_Y }}
          style={{ height: '100%' }}
        />
    </QueryContainer>
  )
}
