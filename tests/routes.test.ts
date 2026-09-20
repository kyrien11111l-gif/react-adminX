import { describe, expect, it } from 'vitest'
import { baseRoutes } from '@/router/config/baseRoutes'
import {
  createLoginUrl,
  getRedirectTargetFromSearch,
  getSafeRedirectTarget
} from '@/utils/navigation'

describe('base routes', () => {
  it('uses the resolved home path for a root redirect', () => {
    expect(getSafeRedirectTarget({ from: '/' }, '/system/user')).toBe(
      '/system/user'
    )
    expect(getSafeRedirectTarget({ from: '/system/user' }, '/system/user')).toBe(
      '/system/user'
    )
    expect(
      getSafeRedirectTarget(
        { from: '/system/user?tab=active#permissions' },
        '/system/user'
      )
    ).toBe('/system/user?tab=active#permissions')
  })

  it('does not define the dashboard as a static route', () => {
    expect(baseRoutes).not.toContainEqual(
      expect.objectContaining({ path: 'dashboard' })
    )
  })

  it('falls back when a redirect target is unsafe', () => {
    expect(getSafeRedirectTarget({ from: 'https://example.com' }, '/403')).toBe(
      '/403'
    )
  })

  it('puts the complete target into the visible login URL', () => {
    expect(createLoginUrl('/system/query')).toBe(
      '/login?redirect=/system/query'
    )

    const loginUrl = createLoginUrl('/system/query?tab=1#top')

    expect(loginUrl).toBe(
      '/login?redirect=/system/query%3Ftab%3D1%23top'
    )
    expect(getRedirectTargetFromSearch(new URL(loginUrl, 'https://admin.test').search)).toBe(
      '/system/query?tab=1#top'
    )
  })
})
