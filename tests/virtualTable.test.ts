import { describe, expect, it } from 'vitest'
import {
  getStableTableLayoutWidth,
  getVirtualTableAvailableHeight,
  getVirtualTableBodyHeight
} from '@/components/virtualTable/utils'
import { getTableScrollWidth } from '@/utils/table'

describe('VirtualTable height helpers', () => {
  it('keeps the body inside both the parent and viewport boundaries', () => {
    expect(getVirtualTableAvailableHeight(120, 700, 900)).toBe(580)
    expect(getVirtualTableAvailableHeight(120, undefined, 900)).toBe(780)
  })

  it('subtracts fixed table chrome and applies the optional body limit', () => {
    expect(getVirtualTableBodyHeight(600, 96)).toBe(504)
    expect(getVirtualTableBodyHeight(600, 96, 360)).toBe(264)
  })

  it('returns a positive numeric scroll height when fixed chrome is larger', () => {
    expect(getVirtualTableBodyHeight(40, 80)).toBe(1)
  })

  it('includes the selection column in the horizontal scroll width', () => {
    expect(getTableScrollWidth(1508, 80)).toBe(1588)
    expect(getTableScrollWidth(1508)).toBe(1508)
  })

  it('keeps the layout width stable while the sidebar collapses', () => {
    const expandedWidth = getStableTableLayoutWidth(1284)
    const collapsedWidth = getStableTableLayoutWidth(1428, 144)

    expect(collapsedWidth).toBe(expandedWidth)
    expect(collapsedWidth).toBe(1282)
  })
})
