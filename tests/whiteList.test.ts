import { describe, expect, it } from 'vitest'
import {
  LOGIN_PATH,
  WHITE_LIST_TEST_PATH
} from '@/router/config/constants'
import { isWhiteRoute } from '@/router/config/whiteList'

describe('white list routes', () => {
  it('allows the login page and the dedicated test page', () => {
    expect(isWhiteRoute(LOGIN_PATH)).toBe(true)
    expect(isWhiteRoute(WHITE_LIST_TEST_PATH)).toBe(true)
  })

  it('keeps authenticated routes outside the white list', () => {
    expect(isWhiteRoute('/dashboard')).toBe(false)
  })
})
