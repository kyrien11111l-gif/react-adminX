import { joinClassNames } from '@/utils/classNames'
import type { PropsWithChildren } from 'react'

const wrapperClassName = 'flex h-full min-h-0 w-full flex-col gap-4 p-4'

interface QueryContainerProps extends PropsWithChildren {
  className?: string
}
export function QueryContainer({ children, className }: QueryContainerProps) {
  return (
    <main className={joinClassNames(wrapperClassName, className)}>
      {children}
    </main>
  )
}