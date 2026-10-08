import { afterEach, describe, expect, it } from 'vitest'
import { applyThemeColorPrimary } from '@/utils/theme'

describe('applyThemeColorPrimary', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--app-primary')
  })

  it('updates the global primary color variable', () => {
    applyThemeColorPrimary('#52c41a')

    expect(
      document.documentElement.style.getPropertyValue('--app-primary')
    ).toBe('#52c41a')
  })
})
