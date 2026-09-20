import { LOGIN_PATH } from '@/router/config/constants'

interface RedirectLocationState {
  from?: string
}

const REDIRECT_PARAM = 'redirect'

function encodeRedirectTarget(target: string): string {
  return encodeURIComponent(target).replaceAll('%2F', '/')
}

export function createLoginUrl(target: string): string {
  return `${LOGIN_PATH}?${REDIRECT_PARAM}=${encodeRedirectTarget(target)}`
}

export function getRedirectTargetFromSearch(
  search: string
): string | undefined {
  return new URLSearchParams(search).get(REDIRECT_PARAM) ?? undefined
}

export function getSafeRedirectTarget(state: unknown, fallback: string): string {
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
