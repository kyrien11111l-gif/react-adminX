import { HOME_PATH } from "@/constants"

interface RedirectLocationState {
  from?: string
}

export function getSafeRedirectTarget(state: unknown, fallback = HOME_PATH): string {
  if (typeof state !== 'object' || state === null || !('from' in state)) {
    return fallback
  }

  const from = (state as RedirectLocationState).from
  if (
    typeof from !== 'string' ||
    !from.startsWith('/') ||
    from.startsWith('//') ||
    from.startsWith('/login')
  ) {
    return fallback
  }

  return from === '/' ? fallback : from
}
