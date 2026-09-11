import { useMatches } from 'react-router-dom'
import { resolveMenuUrl } from '@/utils/menu'
import type { AppRouteHandle } from '@/types'

function hasIframe(handle: unknown): handle is AppRouteHandle {
  return (
    typeof handle === 'object' &&
    handle !== null &&
    'iframe' in handle &&
    typeof handle.iframe === 'string'
  )
}

export function Iframe() {
  const matches = useMatches()
  const routeHandle = [...matches]
    .reverse()
    .map((match) => match.handle)
    .find(hasIframe)
  const src = resolveMenuUrl(routeHandle?.iframe)
  const title = routeHandle?.title ?? '内嵌页面'

  if (!src) {
    return (
      <div className="flex min-h-[480px] items-center justify-center rounded bg-[var(--ant-color-bg-container)] text-[var(--ant-color-text-secondary)]">
        未配置有效的内嵌页面地址
      </div>
    )
  }

  return (
    <iframe
      className="block h-[calc(100dvh-10rem)] min-h-[480px] w-full rounded border-0 bg-[var(--ant-color-bg-container)]"
      title={title}
      src={src}
      allowFullScreen
    />
  )
}
