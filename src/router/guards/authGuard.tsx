import { Button, Result } from 'antd'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import {
  Navigate,
  useLocation,
  useMatches
} from 'react-router-dom'
import {
  FORBIDDEN_PATH,
  LOGIN_PATH
} from '@/router/config/constants'
import { registerDynamicMenuRoutes } from '@/router/dynamic/routeBootstrap'
import { rematchDynamicLocation } from '@/router/dynamic/routeRegistry'
import { isWhiteRoute } from '@/router/config/whiteList'
import { isAppRouteHandle } from '@/router/routeHandle'
import { initializeSession } from '@/services/sessionInitialization'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'
import {
  createLoginUrl,
  getRedirectTargetFromSearch,
  getSafeRedirectTarget
} from '@/utils/navigation'
import { hasPermission } from '@/utils/permission'
import {
  hideStartupLoading,
  showStartupLoading
} from '@/utils/startupLoading'

interface AuthGuardProps {
  children: ReactNode
}

/**
 * 从当前匹配的路由链中，取得最深层业务路由声明的权限码。
 * 父级布局路由没有权限码时，会继续向上查找。
 */
function getRoutePermission(
  matches: ReturnType<typeof useMatches>
): string | undefined {
  return [...matches]
    .reverse()
    .map((match) => match.handle)
    .find(isAppRouteHandle)?.permission
}

function getRouteInitializationError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : '动态路由初始化失败，请稍后重试'
}

/**
 * 根布局下所有路由共用的全局鉴权守卫。
 *
 * 鉴权流程：
 * 1. 先区分登录页、其他白名单页和需要登录的业务页面。
 * 2. 未携带 token 访问业务页时，跳转登录页，并将原始地址写入 redirect 查询参数和 state.from。
 * 3. token 只表示浏览器保存了凭证，不能证明会话有效；访问业务页或登录页时，
 *    都必须加载用户、菜单和权限，由服务端验证 token。
 * 4. 会话数据加载成功后，鉴权守卫注册动态路由并重新匹配原始地址，
 *    路由准备完成后才允许渲染业务页。
 *    登录页则根据 redirect 查询参数或 state.from 跳转目标页。
 * 5. 初始化接口返回 401 时，请求层会统一清空会话并回到登录页；因此不会因为伪造 token
 *    进入业务页面。
 * 6. 已完成初始化后，再根据路由 handle 中的权限码判断是否允许访问；无权限跳转 403。
 * 7. 会话或动态路由初始化发生非 401 错误时，业务页显示重试页；点击重试重置初始化状态，再执行第 3 步。
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation()
  const matches = useMatches()
  const token = useAuthStore((state) => state.token)
  const initialized = usePermissionStore((state) => state.initialized)
  const error = usePermissionStore((state) => state.error)
  const homePath = usePermissionStore((state) => state.homePath)
  const reset = usePermissionStore((state) => state.reset)

  // 当前完整地址：未登录跳转时用于回跳，动态路由注册后也据此重新匹配。
  const target = `${location.pathname}${location.search}${location.hash}`

  // 路由类型：登录页属于白名单，但需要对已有 token 做服务端验证。
  const isLoginRoute = location.pathname === LOGIN_PATH
  const isPublicRoute = isWhiteRoute(location.pathname)
  const requiresAuthentication = !isPublicRoute

  // 只接受站内地址，避免登录后被 state.from 重定向到外部网站。
  const redirectTarget = getSafeRedirectTarget(
    location.state ?? {
      from: getRedirectTargetFromSearch(location.search)
    },
    homePath ?? FORBIDDEN_PATH
  )

  // 动态路由完成匹配后，用其最深层路由的权限码进行最终授权判断。
  const routePermission = getRoutePermission(matches)

  /**
   * 是否需要向服务端验证当前 token。
   * 其他白名单页不触发初始化；登录页有 token 时必须验证，不能直接跳转首页。
   */
  const shouldPrepareRoutes =
    Boolean(token) &&
    !error &&
    (requiresAuthentication || isLoginRoute) &&
    !initialized

  /**
   * 第 3、4 步：加载会话数据，注册动态路由并重匹配当前地址。
   * 登录页由下方 Navigate 负责跳转。
   */
  useEffect(() => {
    if (!shouldPrepareRoutes) {
      return
    }

    let cancelled = false

    void initializeSession()
      .then(({ menus, homePath: initializedHomePath }) => {
        if (cancelled) {
          return
        }

        registerDynamicMenuRoutes(menus)

        if (isLoginRoute) {
          usePermissionStore.getState().markInitialized()
          return
        }

        const restoredTarget =
          location.pathname === '/'
            ? `${initializedHomePath ?? FORBIDDEN_PATH}${location.search}${location.hash}`
            : target

        return rematchDynamicLocation(restoredTarget).then(() => {
          if (!cancelled) {
            usePermissionStore.getState().markInitialized()
          }
        })
      })
      .catch((initializationError: unknown) => {
        if (!cancelled && useAuthStore.getState().token) {
          usePermissionStore
            .getState()
            .setError(getRouteInitializationError(initializationError))
        }
      })
    return () => {
      cancelled = true
    }
  }, [
    isLoginRoute,
    location.hash,
    location.pathname,
    location.search,
    target,
    shouldPrepareRoutes,
    token
  ])

  /** 会话和动态路由准备期间显示启动加载层。 */
  useEffect(() => {
    if (shouldPrepareRoutes) {
      showStartupLoading()
    }
  }, [shouldPrepareRoutes])

  useEffect(() => {
    if (error) {
      hideStartupLoading()
    }
  }, [error])

  function handleRetry() {
    reset()
  }

  // 登录页：只有“存在 token 且已通过服务端初始化验证”才允许进入目标页。
  if (isLoginRoute) {
    if (token && initialized) {
      return <Navigate to={redirectTarget} replace />
    }

    return <>{children}</>
  }

  // 其他白名单页始终可访问，不请求用户、菜单和权限。
  if (isPublicRoute) {
    return <>{children}</>
  }

  // 第 2 步：业务页没有本地凭证时，带上原始地址跳转登录页。
  if (!token) {
    return (
      <Navigate
        to={createLoginUrl(target)}
        replace
        state={{ from: target }}
      />
    )
  }

  // 第 7 步：会话或动态路由初始化失败时提供重试入口。
  if (error) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6">
        <Result
          status="error"
          title="应用初始化失败"
          subTitle={error}
          extra={
            <Button type="primary" onClick={handleRetry}>
              重试
            </Button>
          }
        />
      </main>
    )
  }

  // 第 3 步尚未结束前不渲染业务 Outlet，防止先命中 404 再跳转目标动态路由。
  if (!initialized) {
    return null
  }

  // 第 6 步：会话验证通过后，再判断当前动态路由是否有访问权限。
  if (!hasPermission(routePermission)) {
    return <Navigate to={FORBIDDEN_PATH} replace />
  }

  return <>{children}</>
}
