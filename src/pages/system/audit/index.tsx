import { Result } from 'antd'

export default function AuditPage() {
  return (
    <div className="flex min-h-[calc(100dvh-160px)] items-center justify-center p-6">
      <Result
        status="info"
        title="审计记录"
        subTitle="获得 system:audit:list 权限后可访问此页面。"
      />
    </div>
  )
}
