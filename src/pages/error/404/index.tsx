import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { usePermissionStore } from '@/stores'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const homePath = usePermissionStore((state) => state.homePath)

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <Result
        status="404"
        title="404"
        subTitle="抱歉，你访问的页面不存在或已被移动。"
        extra={homePath ? (
          <Button type="primary" onClick={() => navigate(homePath)}>
            返回首页
          </Button>
        ) : null}
      />
    </div>
  )
}
