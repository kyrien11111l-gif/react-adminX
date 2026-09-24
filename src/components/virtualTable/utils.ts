export const DEFAULT_VIRTUAL_TABLE_SCROLL_Y = 320
export const MIN_VIRTUAL_TABLE_SCROLL_Y = 1

export function getStableTableLayoutWidth(
  availableWidth: number,
  expandedSidebarReserve = 0
) {
  const width = Math.max(0, availableWidth - expandedSidebarReserve)

  return Math.max(2, Math.floor(width / 2) * 2 - 2)
}

function normalizeDimension(value: number) {
  return Number.isFinite(value) ? Math.max(value, 0) : 0
}

export function getVirtualTableBodyHeight(
  totalHeight: number,
  fixedHeight: number,
  maxHeight = Number.POSITIVE_INFINITY
) {
  const normalizedMaxHeight = Number.isFinite(maxHeight)
    ? Math.max(maxHeight, 0)
    : Number.POSITIVE_INFINITY
  const boundedTotalHeight = Math.min(
    normalizeDimension(totalHeight),
    normalizedMaxHeight
  )
  const availableHeight = boundedTotalHeight - normalizeDimension(fixedHeight)

  return Math.max(MIN_VIRTUAL_TABLE_SCROLL_Y, Math.floor(availableHeight))
}

export function getVirtualTableAvailableHeight(
  top: number,
  parentBottom?: number,
  viewportHeight?: number
) {
  const normalizedTop = normalizeDimension(top)
  const boundaries = [
    parentBottom === undefined
      ? Number.POSITIVE_INFINITY
      : parentBottom - normalizedTop,
    viewportHeight === undefined
      ? Number.POSITIVE_INFINITY
      : viewportHeight - normalizedTop
  ].filter(Number.isFinite)

  if (!boundaries.length) {
    return undefined
  }

  return Math.max(0, Math.floor(Math.min(...boundaries)))
}
