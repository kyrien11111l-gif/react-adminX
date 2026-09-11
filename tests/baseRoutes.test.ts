import { describe, expect, it } from 'vitest'
import { baseRoutes } from '@/router/config/baseRoutes'

describe('baseRoutes', () => {
  it('loads the 404 page through a React lazy component', () => {
    const fallbackRoute = baseRoutes.find((route) => route.path === '*')

    expect(fallbackRoute?.Component).toBeDefined()
    expect(fallbackRoute?.lazy).toBeUndefined()
  })
})
