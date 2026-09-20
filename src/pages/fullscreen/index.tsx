import { ArrowLeftOutlined, ExpandOutlined } from '@ant-design/icons'
import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { usePermissionStore } from '@/stores'

export default function FullscreenPage() {
  const navigate = useNavigate()
  const homePath = usePermissionStore((state) => state.homePath)
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <Result
        status="info"
        icon={<ExpandOutlined />}
        title="这是一个全屏业务页面"
        subTitle="当前路由只经过 AuthGuard，不会渲染 Sidebar、Header 或标签页。"
        extra={homePath ? (
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(homePath)}
          >
            返回首页
          </Button>
        ) : null}
      />
    </main>
  )
}
