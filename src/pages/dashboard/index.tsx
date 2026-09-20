import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  TeamOutlined
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Col,
  Progress,
  Row,
  Statistic,
  Tag,
  Timeline,
  Typography
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores'

const statistics = [
  {
    title: '活跃用户',
    value: 1286,
    suffix: '人',
    icon: <TeamOutlined />
  },
  {
    title: '今日请求',
    value: 24380,
    suffix: '次',
    icon: <ClockCircleOutlined />
  },
  {
    title: '权限策略',
    value: 42,
    suffix: '条',
    icon: <SafetyCertificateOutlined />
  },
  {
    title: '服务可用率',
    value: 99.98,
    precision: 2,
    suffix: '%',
    icon: <CheckCircleOutlined />
  }
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useUserStore((state) => state.user)

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <Card>
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} md={16}>
            <Typography.Title level={3}>你好啊！{user?.nickname ?? '管理员'}</Typography.Title>
            <Typography.Paragraph type="secondary">
              用户、菜单与权限已经由统一初始化流程加载完成。
            </Typography.Paragraph>
          </Col>
          <Col>
          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            iconPlacement="end"
            onClick={() => navigate('/system/user')}
          >
            管理用户
          </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {statistics.map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.title}>
            <Card>
              <Statistic
                title={item.title}
                value={item.value}
                precision={item.precision}
                suffix={item.suffix}
                prefix={item.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card title="平台健康度" extra={<Tag color="success">实时</Tag>}>
            <Row gutter={[24, 24]}>
            {[
              ['接口成功率', 99.8],
              ['权限命中率', 96.4],
              ['任务完成率', 87.2]
            ].map(([label, value]) => (
              <Col xs={24} md={8} key={String(label)}>
                <Typography.Text>{label}</Typography.Text>
                <Progress
                  percent={Number(value)}
                  showInfo={false}
                />
              </Col>
            ))}
            </Row>
            <Alert
              className="mt-6"
              type="info"
              showIcon
              title="架构状态"
              description="工作台由服务端菜单提供，动态业务路由和 PageLayout 相互独立，可继续扩展真实业务模块。"
            />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="最近活动">
            <Timeline
              items={[
                { color: 'green', content: '动态菜单加载完成' },
                { content: '用户权限校验通过' },
                { color: 'gray', content: 'Mock API 服务已连接' }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
