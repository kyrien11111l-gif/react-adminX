import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { usePermissionStore } from '@/stores'

export default function ForbiddenPage() {
  const navigate = useNavigate()
  const homePath = usePermissionStore((state) => state.homePath)

  return (
    <div className="flex min-h-[calc(100dvh-160px)] items-center justify-center p-6">
      <Result
        status="403"
        title="403"
        subTitle="你没有访问此页面的权限。如有需要，请联系系统管理员。"
        extra={homePath ? (
          <Button type="primary" onClick={() => navigate(homePath)}>
            返回首页
          </Button>
        ) : null}
      />
    </div>
  )
}
