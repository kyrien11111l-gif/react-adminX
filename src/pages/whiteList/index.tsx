import { Link } from 'react-router-dom'
import { LOGIN_PATH } from '@/router/config/constants'

export default function WhiteListPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--app-background)] p-6 text-center">
      <section className="max-w-md space-y-3">
        <p className="text-sm font-medium text-[var(--ant-color-primary)]">
          White list route
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ant-color-text)]">
          白名单路由已放行
        </h1>
        <p className="text-sm leading-6 text-[var(--app-secondary-text)]">
          此页面无需登录，不会触发用户、菜单或权限初始化请求。
        </p>
        <Link
          to={LOGIN_PATH}
          className="inline-flex text-sm text-[var(--ant-color-primary)] hover:underline"
        >
          前往登录页
        </Link>
      </section>
    </main>
  )
}
