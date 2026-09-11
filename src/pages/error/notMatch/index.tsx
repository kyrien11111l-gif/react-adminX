import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function ComponentNotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <Result
        status="warning"
        title="页面组件未匹配"
        subTitle="当前菜单已注册，但关联的页面组件未配置或不存在。"
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            返回工作台
          </Button>
        }
      />
    </div>
  )
}
