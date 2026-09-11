import { SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons'
import { Card, Col, Row, Statistic, Table, Tag, Typography } from 'antd'
import type { TableColumnsType } from 'antd'

interface RoleRow {
  id: number
  name: string
  code: string
  members: number
  scope: string
  builtIn: boolean
}

const roles: RoleRow[] = [
  {
    id: 1,
    name: '超级管理员',
    code: 'admin',
    members: 1,
    scope: '全部数据',
    builtIn: true
  },
  {
    id: 2,
    name: '运营管理员',
    code: 'operator',
    members: 8,
    scope: '本部门数据',
    builtIn: false
  },
  {
    id: 3,
    name: '只读审计员',
    code: 'auditor',
    members: 3,
    scope: '全部数据（只读）',
    builtIn: false
  },
  {
    id: 4,
    name: '只读审计员',
    code: 'auditor',
    members: 4,
    scope: '全部数据（只读）',
    builtIn: false
  }
]

const columns: TableColumnsType<RoleRow> = [
  {
    title: '角色名称',
    dataIndex: 'name',
    render: (name: string, record) => (
      <div>
        <Typography.Text strong>{name}</Typography.Text>
        {record.builtIn ? <Tag className="ml-2">内置</Tag> : null}
      </div>
    )
  },
  {
    title: '角色编码',
    dataIndex: 'code',
    render: (code: string) => <Typography.Text code>{code}</Typography.Text>
  },
  { title: '成员数', dataIndex: 'members' },
  { title: '数据范围', dataIndex: 'scope', responsive: ['md'] }
]

export default function RolePage() {
  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="角色总数" value={3} prefix={<SafetyCertificateOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="已分配成员" value={12} prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="角色总数" value={3} prefix={<SafetyCertificateOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="已分配成员" value={12} prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="角色总数" value={3} prefix={<SafetyCertificateOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="已分配成员" value={12} prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="角色总数" value={3} prefix={<SafetyCertificateOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="已分配成员" value={12} prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="角色总数" value={3} prefix={<SafetyCertificateOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="已分配成员" value={12} prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="角色总数" value={3} prefix={<SafetyCertificateOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="已分配成员" value={12} prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="角色总数" value={3} prefix={<SafetyCertificateOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="已分配成员" value={12} prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="角色总数" value={3} prefix={<SafetyCertificateOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="已分配成员" value={12} prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="角色总数" value={3} prefix={<SafetyCertificateOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="已分配成员" value={12} prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>
      <Card title="角色列表">
        <Table<RoleRow>
          rowKey="id"
          columns={columns}
          dataSource={roles}
          pagination={false}
          scroll={{ x: 640 }}
        />
      </Card>
    </div>
  )
}
