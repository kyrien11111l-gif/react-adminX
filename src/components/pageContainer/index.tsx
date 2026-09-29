import type { PropsWithChildren } from 'react'
import SimpleBar from 'simplebar-react'

import { joinClassNames } from '@/utils/classNames'

const wrapperClassName = 'h-full p-4 overflow-hidden'

interface PageContainerProps extends PropsWithChildren {
  className?: string
}

export function PageContainer({ children, className }:PageContainerProps) {
  return (
    <div className={joinClassNames(wrapperClassName, className)}>
      <SimpleBar autoHide={false} className='h-full min-h-0'>
        {children}
      </SimpleBar>
    </div>
  )
}