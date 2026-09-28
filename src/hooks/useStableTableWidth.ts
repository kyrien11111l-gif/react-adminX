import type { TableRef } from 'antd'
import { useLayoutEffect, useRef, type RefObject } from 'react'
import {
  MOBILE_LAYOUT_MEDIA_QUERY,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
  TOP_NAVIGATION
} from '@/constants'
import { getStableTableLayoutWidth } from '@/components/virtualTable/utils'
import { useLayoutStore } from '@/stores'

const MAX_STABLE_TABLE_SCALE = 1.25

export function useStableTableWidth(
  enabled: boolean,
  containerRef?: RefObject<HTMLElement | null>,
  maxLayoutWidth?: number
) {
  const tableRef = useRef<TableRef>(null)
  const maxLayoutWidthRef = useRef(maxLayoutWidth)
  const updateLayoutWidthRef = useRef<(() => void) | undefined>(undefined)
  const previousMaxLayoutWidthRef = useRef(maxLayoutWidth)

  useLayoutEffect(() => {
    if (!enabled) {
      return
    }

    const tableElement = tableRef.current?.nativeElement
    const container = containerRef?.current ?? tableElement?.parentElement

    if (!tableElement || !container) {
      return
    }

    let frameId = 0
    let layoutWidth = 0
    const sidebarWidthDifference = SIDEBAR_WIDTH - SIDEBAR_COLLAPSED_WIDTH
    const updateVisualWidth = (availableWidth: number) => {
      if (layoutWidth > 0) {
        tableElement.style.transform = `scaleX(${availableWidth / layoutWidth})`
      }
    }
    const updateLayoutWidth = () => {
      const state = useLayoutStore.getState()
      const reserveExpandedSidebar =
        !window.matchMedia(MOBILE_LAYOUT_MEDIA_QUERY).matches &&
        !state.contentMaximized &&
        state.navigationStyle !== TOP_NAVIGATION &&
        state.collapsed
      const stableWidth = getStableTableLayoutWidth(
        container.clientWidth,
        reserveExpandedSidebar ? sidebarWidthDifference : 0
      )
      // 表头和表体各有一张 table，超过列宽总和后会独立分配余量。
      // 优先保持原列宽，仅在宽屏下放宽布局以限制文字的横向缩放。
      const currentMaxLayoutWidth = maxLayoutWidthRef.current
      layoutWidth = currentMaxLayoutWidth
        ? Math.max(
            Math.min(stableWidth, currentMaxLayoutWidth),
            Math.ceil(container.clientWidth / MAX_STABLE_TABLE_SCALE)
          )
        : stableWidth
      tableElement.style.width = `${layoutWidth}px`
      tableElement.style.transformOrigin = 'left top'
      tableElement.style.willChange = 'transform'
      updateVisualWidth(container.clientWidth)
    }

    updateLayoutWidthRef.current = updateLayoutWidth
    updateLayoutWidth()
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver((entries) => {
          updateVisualWidth(
            entries[0]?.contentRect.width ?? container.clientWidth
          )
        })
    resizeObserver?.observe(container)

    const unsubscribe = useLayoutStore.subscribe((state, previous) => {
      if (
        state.navigationStyle !== previous.navigationStyle ||
        state.contentMaximized !== previous.contentMaximized
      ) {
        cancelAnimationFrame(frameId)
        frameId = requestAnimationFrame(updateLayoutWidth)
      }
    })
    window.addEventListener('resize', updateLayoutWidth)

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver?.disconnect()
      unsubscribe()
      window.removeEventListener('resize', updateLayoutWidth)
      updateLayoutWidthRef.current = undefined
      tableElement.style.removeProperty('width')
      tableElement.style.removeProperty('transform')
      tableElement.style.removeProperty('transform-origin')
      tableElement.style.removeProperty('will-change')
    }
  }, [containerRef, enabled])

  useLayoutEffect(() => {
    if (Object.is(previousMaxLayoutWidthRef.current, maxLayoutWidth)) {
      return
    }

    previousMaxLayoutWidthRef.current = maxLayoutWidth
    maxLayoutWidthRef.current = maxLayoutWidth
    updateLayoutWidthRef.current?.()
  }, [maxLayoutWidth])

  return tableRef
}
