import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <Result
        status="404"
        title="404"
        subTitle="抱歉，你访问的页面不存在或已被移动。"
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            返回工作台
          </Button>
        }
      />
    </div>
  )
}
