import {
  DownloadOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons'
import {
  App,
  Button,
  Card,
  Flex,
  Input,
  Space,
  Tag,
  Typography
} from 'antd'
import type { TableColumnsType } from 'antd'
import { useMemo, useState } from 'react'
import { Permission } from '@/components/permission'
import { AutoHeightTable } from '@/components/autoHeightTable'
import { TableToolbar } from '@/components/tableToolbar'
import type { TableDensity } from '@/components/tableToolbar'
import { useTableColumns } from '@/hooks'

interface UserRow {
  id: number
  username: string
  nickname: string
  role: string
  department: string
  email: string
  phone: string
  status: 'enabled' | 'disabled'
  lastLogin: string
  createdAt: string
}

const users: UserRow[] = [
  {
    id: 1,
    username: 'admin',
    nickname: 'Administrator',
    role: '超级管理员',
    department: '平台技术部',
    email: 'admin@example.com',
    phone: '138****0001',
    status: 'enabled',
    lastLogin: '2026-08-19 18:32',
    createdAt: '2025-01-08 09:00'
  },
  {
    id: 2,
    username: 'operator',
    nickname: '运营同学',
    role: '运营管理员',
    department: '运营中心',
    email: 'operator@example.com',
    phone: '138****0002',
    status: 'enabled',
    lastLogin: '2026-08-19 15:20',
    createdAt: '2025-02-14 10:30'
  },
  {
    id: 3,
    username: 'auditor',
    nickname: '审计专员',
    role: '只读审计员',
    department: '审计合规部',
    email: 'auditor@example.com',
    phone: '138****0003',
    status: 'disabled',
    lastLogin: '2026-08-17 09:45',
    createdAt: '2025-03-21 14:20'
  },
  {
    id: 4,
    username: 'wangxiaomin',
    nickname: '王晓敏',
    role: '业务管理员',
    department: '客户服务部',
    email: 'wangxiaomin@example.com',
    phone: '138****0004',
    status: 'enabled',
    lastLogin: '2026-08-16 11:28',
    createdAt: '2025-04-03 08:45'
  },
  {
    id: 5,
    username: 'lichen',
    nickname: '李晨',
    role: '数据分析师',
    department: '数据产品部',
    email: 'lichen@example.com',
    phone: '138****0005',
    status: 'enabled',
    lastLogin: '2026-08-15 16:05',
    createdAt: '2025-04-18 13:10'
  },
  {
    id: 6,
    username: 'zhouhang',
    nickname: '周航',
    role: '安全管理员',
    department: '信息安全部',
    email: 'zhouhang@example.com',
    phone: '138****0006',
    status: 'enabled',
    lastLogin: '2026-08-14 09:36',
    createdAt: '2025-05-12 11:40'
  },
  {
    id: 7,
    username: 'chenlu',
    nickname: '陈璐',
    role: '内容运营',
    department: '运营中心',
    email: 'chenlu@example.com',
    phone: '138****0007',
    status: 'disabled',
    lastLogin: '2026-08-10 17:22',
    createdAt: '2025-06-07 15:25'
  },
  {
    id: 8,
    username: 'zhaobo',
    nickname: '赵博',
    role: '开发工程师',
    department: '平台技术部',
    email: 'zhaobo@example.com',
    phone: '138****0008',
    status: 'enabled',
    lastLogin: '2026-08-09 20:18',
    createdAt: '2025-06-19 10:05'
  },
  {
    id: 9,
    username: 'sunyi',
    nickname: '孙怡',
    role: '产品经理',
    department: '产品管理部',
    email: 'sunyi@example.com',
    phone: '138****0009',
    status: 'enabled',
    lastLogin: '2026-08-08 14:50',
    createdAt: '2025-07-02 09:30'
  },
  {
    id: 10,
    username: 'guoyang',
    nickname: '郭洋',
    role: '测试工程师',
    department: '质量保障部',
    email: 'guoyang@example.com',
    phone: '138****0010',
    status: 'enabled',
    lastLogin: '2026-08-07 10:12',
    createdAt: '2025-07-16 16:00'
  },
  {
    id: 11,
    username: 'machao',
    nickname: '马超',
    role: '项目经理',
    department: '项目管理部',
    email: 'machao@example.com',
    phone: '138****0011',
    status: 'disabled',
    lastLogin: '2026-07-30 18:40',
    createdAt: '2025-08-11 12:15'
  }
]

const columns: TableColumnsType<UserRow> = [
  {
    title: '用户',
    dataIndex: 'nickname',
    width: 220,
    render: (nickname: string, record) => (
      <div>
        <Typography.Text strong>{nickname}</Typography.Text>
        <br />
        <Typography.Text type="secondary">@{record.username}</Typography.Text>
      </div>
    )
  },
  { title: '角色', dataIndex: 'role', width: 180 },
  { title: '部门', dataIndex: 'department', width: 180 },
  { title: '邮箱', dataIndex: 'email', width: 240 },
  { title: '手机号', dataIndex: 'phone', width: 150 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    render: (status: UserRow['status']) =>
      status === 'enabled' ? (
        <Tag color="success">已启用</Tag>
      ) : (
        <Tag>已停用</Tag>
      )
  },
  { title: '最近登录', dataIndex: 'lastLogin', width: 180 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 100,
    render: () => (
      <Button type="link">
        查看
      </Button>
    )
  }
]

export default function UserPage() {
  const { message } = App.useApp()
  const [keyword, setKeyword] = useState('')
  const [density, setDensity] = useState<TableDensity>('medium')
  const filteredUsers = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    if (!normalizedKeyword) return users
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(normalizedKeyword) ||
        user.nickname.toLowerCase().includes(normalizedKeyword) ||
        user.department.toLowerCase().includes(normalizedKeyword) ||
        user.email.toLowerCase().includes(normalizedKeyword)
    )
  }, [keyword])
  const {
    columnSettings,
    tableColumns,
    tableScrollX,
    onColumnSettingsChange,
    resetColumnSettings
  } = useTableColumns<UserRow>({ columns })

  return (
    <div className="mx-auto w-full ">
      <Card>
        <Flex justify="space-between" align="start" gap={16} wrap className="mb-6">
          <div>
            <Typography.Title level={3}>用户列表</Typography.Title>
            <Typography.Text type="secondary">
              统一管理账号、角色与启用状态，权限实时生效
            </Typography.Text>
          </div>
          <Space wrap>
            <Permission code="system:user:list">
              <Button
                icon={<DownloadOutlined />}
                onClick={() => void message.success('导出任务已创建')}
              >
                导出
              </Button>
            </Permission>
            <Permission code="system:user:create">
              <Button type="primary" icon={<PlusOutlined />}>
                新增用户
              </Button>
            </Permission>
          </Space>
        </Flex>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="搜索用户名或昵称"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="mb-4 max-w-xs"
          aria-label="搜索用户"
        />
        <TableToolbar
          title="用户明细"
          density={density}
          onDensityChange={setDensity}
          columnSettings={columnSettings}
          onColumnSettingsChange={onColumnSettingsChange}
          onColumnSettingsReset={resetColumnSettings}
        />
        <AutoHeightTable<UserRow>
          rowKey="id"
          columns={tableColumns}
          dataSource={filteredUsers}
          size={density}
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条`
          }}
          scroll={{ x: tableScrollX }}
        />
      </Card>
    </div>
  )
}
