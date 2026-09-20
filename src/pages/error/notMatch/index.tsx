import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { usePermissionStore } from '@/stores'

export default function ComponentNotFoundPage() {
  const navigate = useNavigate()
  const homePath = usePermissionStore((state) => state.homePath)

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <Result
        status="warning"
        title="页面组件未匹配"
        subTitle="当前菜单已注册，但关联的页面组件未配置或不存在。"
        extra={homePath ? (
          <Button type="primary" onClick={() => navigate(homePath)}>
            返回首页
          </Button>
        ) : null}
      />
    </div>
  )
}
