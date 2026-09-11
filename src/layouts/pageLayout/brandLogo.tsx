import { Typography } from 'antd'
import { Link } from 'react-router-dom'
import brandLogo from '@/assets/logo.svg'
import { APP_NAME, HOME_PATH } from '@/constants'
import { useLayoutStore } from '@/stores'

interface BrandLogoProps {
  collapsed?: boolean
  className?: string
}

export function BrandLogo({ collapsed = false, className }: BrandLogoProps) {
  const headerHeight = useLayoutStore((state) => state.headerHeight)

  return (
    <Link
      to={HOME_PATH}
      className={`flex w-full items-center gap-2 overflow-hidden rounded-none ps-4 pe-[15px] text-inherit no-underline ${className ?? ''}`}
      style={{ height: headerHeight }}
      aria-label={`返回${APP_NAME}首页`}
    >
      <img
        src={brandLogo}
        alt=""
        width={32}
        height={32}
        className="size-8 shrink-0"
      />
      <Typography.Text
        strong
        ellipsis
        className={`min-w-0 whitespace-nowrap transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          collapsed ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {APP_NAME}
      </Typography.Text>
    </Link>
  )
}
