/* eslint-disable react-hooks/refs -- 测试夹具需要把真实 DOM ref 传给被测 Hook。 */
import {
  act,
  createElement,
  forwardRef,
  useImperativeHandle,
  useRef
} from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import type { TableRef } from 'antd'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useStableTableWidth } from '@/hooks/useStableTableWidth'
import { useLayoutStore } from '@/stores'

let container: HTMLDivElement
let currentWidth: number
let resizeCallback: ResizeObserverCallback | undefined
let root: Root
let originalClientWidthDescriptor: PropertyDescriptor | undefined

class ResizeObserverMock implements ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeCallback = callback
  }

  disconnect() {}

  observe() {}

  unobserve() {}
}

const TestTable = forwardRef<TableRef>(function TestTable(_, ref) {
  const nativeRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    nativeElement: nativeRef.current as HTMLDivElement,
    scrollTo: () => {}
  }))

  return createElement('div', {
    className: 'test-table',
    ref: nativeRef
  })
})

function StableTableWidthHarness() {
  const containerRef = useRef<HTMLDivElement>(null)
  const tableRef = useStableTableWidth(true, containerRef)

  return createElement(
    'div',
    { ref: containerRef },
    createElement(TestTable, { ref: tableRef })
  )
}

function getTableElement() {
  return container.querySelector<HTMLDivElement>('.test-table')
}

function notifyContainerResize(width: number) {
  resizeCallback?.(
    [{ contentRect: { width } } as ResizeObserverEntry],
    {} as ResizeObserver
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  currentWidth = 1124
  resizeCallback = undefined
  useLayoutStore.setState({ collapsed: false, contentMaximized: false })
  originalClientWidthDescriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'clientWidth'
  )
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => currentWidth
  })
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  })))
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()

  if (originalClientWidthDescriptor) {
    Object.defineProperty(
      HTMLElement.prototype,
      'clientWidth',
      originalClientWidthDescriptor
    )
  }

  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('useStableTableWidth', () => {
  it('releases stale scaling while a viewport resize changes responsive layout', () => {
    act(() => root.render(createElement(StableTableWidthHarness)))
    expect(getTableElement()?.style.width).toBe('1122px')

    currentWidth = 196
    act(() => window.dispatchEvent(new Event('resize')))
    currentWidth = 406
    act(() => notifyContainerResize(currentWidth))

    expect(getTableElement()?.style.width).toBe('')
    expect(getTableElement()?.style.transform).toBe('')

    act(() => vi.advanceTimersByTime(200))

    expect(getTableElement()?.style.width).toBe('404px')
    expect(getTableElement()?.style.transform).toBe(
      'scaleX(1.004950495049505)'
    )
  })

  it('rebuilds the layout from the final container width after maximizing', () => {
    currentWidth = 406
    act(() => root.render(createElement(StableTableWidthHarness)))
    expect(getTableElement()?.style.width).toBe('404px')

    currentWidth = 1332
    act(() => window.dispatchEvent(new Event('resize')))
    currentWidth = 1124
    act(() => notifyContainerResize(currentWidth))
    act(() => vi.advanceTimersByTime(200))

    expect(getTableElement()?.style.width).toBe('1122px')
    expect(getTableElement()?.style.transform).toBe(
      'scaleX(1.0017825311942958)'
    )
  })
})
