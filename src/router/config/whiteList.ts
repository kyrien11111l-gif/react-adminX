import {
  LOGIN_PATH,
  WHITE_LIST_TEST_PATH
} from '@/router/config/constants'

const whiteRoutePaths = new Set<string>([
  LOGIN_PATH,
  WHITE_LIST_TEST_PATH
])

export function isWhiteRoute(pathname: string): boolean {
  return whiteRoutePaths.has(pathname)
}
