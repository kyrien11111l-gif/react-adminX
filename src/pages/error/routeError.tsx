import { Button, Result, Typography } from 'antd'
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError
} from 'react-router-dom'

function getErrorDetails(error: unknown): {
  title: string
  message: string
  detail?: string
} {
  if (isRouteErrorResponse(error)) {
    return {
      title: String(error.status),
      message: error.statusText || '路由请求失败',
      detail: typeof error.data === 'string' ? error.data : undefined
    }
  }

  if (error instanceof Error) {
    return {
      title: '页面加载失败',
      message: '页面暂时无法打开，请重试或返回工作台。',
      detail: import.meta.env.DEV ? error.message : undefined
    }
  }

  return { title: '发生未知错误', message: '请稍后重试。' }
}

export function RouteErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()
  const details = getErrorDetails(error)

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <Result
        status="error"
        title={details.title}
        subTitle={details.message}
        extra={[
          <Button
            type="primary"
            key="retry"
            onClick={() => window.location.reload()}
          >
            重新加载
          </Button>,
          <Button key="home" onClick={() => navigate('/dashboard')}>
            返回工作台
          </Button>
        ]}
      >
        {details.detail ? (
          <Typography.Paragraph code className="max-w-xl break-all text-left">
            {details.detail}
          </Typography.Paragraph>
        ) : null}
      </Result>
    </main>
  )
}
