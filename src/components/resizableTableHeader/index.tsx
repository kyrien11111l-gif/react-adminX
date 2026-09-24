import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ThHTMLAttributes
} from 'react'
import '@/components/resizableTableHeader/style.css'
import { joinClassNames } from '@/utils/classNames'

export interface ResizableHeaderCellProps
  extends ThHTMLAttributes<HTMLTableCellElement> {
  maxWidth?: number
  minWidth?: number
  onColumnResize?: (width: number) => void
  resizeLabel?: string
  width?: number
}

interface ResizeSession {
  pointerId: number
  scaleX: number
  startWidth: number
  startX: number
}

function clampWidth(width: number, minWidth: number, maxWidth: number) {
  return Math.min(Math.max(Math.round(width), minWidth), maxWidth)
}

export function ResizableHeaderCell({
  children,
  className,
  maxWidth = Number.POSITIVE_INFINITY,
  minWidth = 1,
  onColumnResize,
  resizeLabel = '当前列',
  width,
  ...restProps
}: ResizableHeaderCellProps) {
  const resizeSessionRef = useRef<ResizeSession | undefined>(undefined)
  const [resizing, setResizing] = useState(false)
  const canResize = typeof width === 'number' && onColumnResize !== undefined

  function handlePointerDown(event: PointerEvent<HTMLSpanElement>) {
    if (!canResize || (event.pointerType === 'mouse' && event.button !== 0)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    const headerCell = event.currentTarget.closest('th')
    const scaleX = headerCell && headerCell.offsetWidth > 0
      ? headerCell.getBoundingClientRect().width / headerCell.offsetWidth
      : 1
    resizeSessionRef.current = {
      pointerId: event.pointerId,
      scaleX: scaleX > 0 ? scaleX : 1,
      startWidth: width,
      startX: event.clientX
    }
    setResizing(true)
  }

  function handlePointerMove(event: PointerEvent<HTMLSpanElement>) {
    const session = resizeSessionRef.current

    if (!session || session.pointerId !== event.pointerId || !onColumnResize) {
      return
    }

    if (event.pointerType === 'mouse' && event.buttons === 0) {
      finishResize(event)
      return
    }

    event.preventDefault()
    onColumnResize(
      clampWidth(
        session.startWidth + (event.clientX - session.startX) / session.scaleX,
        minWidth,
        maxWidth
      )
    )
  }

  function finishResize(event: PointerEvent<HTMLSpanElement>) {
    const session = resizeSessionRef.current

    if (!session || session.pointerId !== event.pointerId) {
      return
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    resizeSessionRef.current = undefined
    setResizing(false)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (!canResize || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    const direction = event.key === 'ArrowLeft' ? -1 : 1
    const step = event.shiftKey ? 24 : 8
    onColumnResize(
      clampWidth(width + direction * step, minWidth, maxWidth)
    )
  }

  return (
    <th
      {...restProps}
      className={joinClassNames(
        className,
        'resizable-table-header-cell',
        resizing ? 'resizable-table-header-cell-resizing' : null
      )}
    >
      {children}
      {canResize ? (
        <span
          className="resizable-table-column-handle"
          role="separator"
          aria-label={`调整${resizeLabel}宽度`}
          aria-orientation="vertical"
          aria-valuemax={Number.isFinite(maxWidth) ? maxWidth : undefined}
          aria-valuemin={minWidth}
          aria-valuenow={width}
          tabIndex={0}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={handleKeyDown}
          onPointerCancel={finishResize}
          onPointerDown={handlePointerDown}
          onLostPointerCapture={finishResize}
          onPointerMove={handlePointerMove}
          onPointerUp={finishResize}
        />
      ) : null}
    </th>
  )
}
