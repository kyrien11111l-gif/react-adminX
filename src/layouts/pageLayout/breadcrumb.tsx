import { Breadcrumb } from 'antd'
import { useMatches } from 'react-router-dom'
import { DEFAULT_PAGE_TITLE } from '@/constants'
import { isAppRouteHandle } from '@/router/routeHandle'

export function AppBreadcrumb() {
  const matches = useMatches()
  const items = matches
    .flatMap((match) =>
      isAppRouteHandle(match.handle) && match.handle.title
        ? [{ title: match.handle.title }]
        : []
    )
    .filter(
      (item, index, entries) =>
        index === 0 || entries[index - 1].title !== item.title
    )

  return (
    <Breadcrumb
      className="min-w-0 max-[991px]:hidden"
      items={items.length ? items : [{ title: DEFAULT_PAGE_TITLE }]}
    />
  )
}
