import type { ReactNode } from 'react'
import { usePermissionStore } from '@/stores'

interface PermissionProps {
  code: string
  children: ReactNode
}

export function Permission({ code, children }: PermissionProps) {
  const allowed = usePermissionStore((state) =>
    state.permissions.includes(code)
  )
  return allowed ? children : null
}
