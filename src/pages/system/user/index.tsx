import {
  DownloadOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons'
import { App, Button, Card, Flex, Input, Space, Table, Tag, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { useMemo, useState } from 'react'
import { Permission } from '@/components/permission'

interface UserRow {
  id: number
  username: string
  nickname: string
  role: string
  status: 'enabled' | 'disabled'
  lastLogin: string
}

const users: UserRow[] = [
  {
    id: 1,
    username: 'admin',
    nickname: 'Administrator',
    role: '超级管理员',
    status: 'enabled',
    lastLogin: '2026-08-19 18:32'
  },
  {
    id: 2,
    username: 'operator',
    nickname: '运营同学',
    role: '运营管理员',
    status: 'enabled',
    lastLogin: '2026-08-19 15:20'
  },
  {
    id: 3,
    username: 'auditor',
    nickname: '审计专员',
    role: '只读审计员',
    status: 'disabled',
    lastLogin: '2026-08-17 09:45'
  }
]

const columns: TableColumnsType<UserRow> = [
  {
    title: '用户',
    dataIndex: 'nickname',
    render: (nickname: string, record) => (
      <div>
        <Typography.Text strong>{nickname}</Typography.Text>
        <br />
        <Typography.Text type="secondary">@{record.username}</Typography.Text>
      </div>
    )
  },
  { title: '角色', dataIndex: 'role' },
  {
    title: '状态',
    dataIndex: 'status',
    render: (status: UserRow['status']) =>
      status === 'enabled' ? (
        <Tag color="success">已启用</Tag>
      ) : (
        <Tag>已停用</Tag>
      )
  },
  { title: '最近登录', dataIndex: 'lastLogin', responsive: ['md'] },
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
  const filteredUsers = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    if (!normalizedKeyword) return users
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(normalizedKeyword) ||
        user.nickname.toLowerCase().includes(normalizedKeyword)
    )
  }, [keyword])

  return (
    <div className="mx-auto w-full max-w-[1600px]">
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
        <Table<UserRow>
          rowKey="id"
          columns={columns}
          dataSource={filteredUsers}
          size="middle"
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条`
          }}
          scroll={{ x: 720 }}
        />
      </Card>
    </div>
  )
}
