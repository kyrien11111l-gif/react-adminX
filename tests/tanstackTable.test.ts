import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TanstackTable } from '@/components/tanstackTable'
import type { TanstackColumn } from '@/components/tanstackTable'

interface Row {
  id: number
  name: string
  children?: Row[]
}

const columns: TanstackColumn<Row>[] = [
  { key: 'name', title: '名称', sortable: true }
]
const rows: Row[] = [
  { id: 1, name: '甲', children: [{ id: 3, name: '子项' }] },
  { id: 2, name: '乙' }
]
const thresholdRows: Row[] = Array.from({ length: 100 }, (_, index) => ({ id: index + 1, name: `第${index + 1}行` }))

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
})

function render(selection?: 'radio' | 'checkbox', expansion?: 'tree' | 'detail') {
  act(() => {
    root.render(createElement(TanstackTable<Row>, {
      columns,
      dataSource: rows,
      rowKey: (row) => row.id,
      rowSelection: selection ? { type: selection } : undefined,
      getSubRows: expansion === 'tree' ? (row) => row.children : undefined,
      renderExpandedRow: expansion === 'detail' ? (row) => createElement('div', null, `子表格：${row.name}`) : undefined
    }))
  })
}

describe('TanstackTable optional capabilities', () => {
  it('shows fixed-column shadows only while content remains behind each edge', () => {
    const fixedColumns: TanstackColumn<Row>[] = [
      { key: 'name', title: '名称', fixed: 'left' },
      { key: 'id', title: '编号' },
      { key: 'action', title: '操作', fixed: 'right', accessor: () => '查看' }
    ]
    act(() => root.render(createElement(TanstackTable<Row>, {
      columns: fixedColumns,
      dataSource: rows,
      rowKey: (row) => row.id,
      rowSelection: { type: 'checkbox' }
    })))
    const scroll = container.querySelector<HTMLElement>('.tanstack-table-scroll')!
    Object.defineProperties(scroll, {
      clientWidth: { configurable: true, value: 300 },
      scrollWidth: { configurable: true, value: 800 }
    })
    const headers = container.querySelectorAll('thead th')
    act(() => scroll.dispatchEvent(new Event('scroll')))
    expect(headers[1].classList.contains('tanstack-table-shadow-left')).toBe(false)
    expect(headers[3].classList.contains('tanstack-table-shadow-right')).toBe(true)

    scroll.scrollLeft = 200
    act(() => scroll.dispatchEvent(new Event('scroll')))
    expect(headers[1].classList.contains('tanstack-table-shadow-left')).toBe(true)
    expect(headers[3].classList.contains('tanstack-table-shadow-right')).toBe(true)

    scroll.scrollLeft = 500
    act(() => scroll.dispatchEvent(new Event('scroll')))
    expect(headers[1].classList.contains('tanstack-table-shadow-left')).toBe(true)
    expect(headers[3].classList.contains('tanstack-table-shadow-right')).toBe(false)
  })

  it('omits selection controls unless enabled', () => {
    render()
    expect(container.querySelectorAll('input[type="checkbox"], input[type="radio"]')).toHaveLength(0)
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2)
  })

  it('starts row virtualization at 100 rows', () => {
    const renderRows = (dataSource: Row[]) => act(() => root.render(createElement(TanstackTable<Row>, {
      columns,
      dataSource,
      rowKey: (row) => row.id,
      virtualize: true
    })))

    renderRows(thresholdRows.slice(0, 99))
    expect(container.querySelector('table')?.classList.contains('tanstack-table-virtualized')).toBe(false)
    expect(container.querySelectorAll('tbody tr')).toHaveLength(99)

    renderRows(thresholdRows)
    expect(container.querySelector('table')?.classList.contains('tanstack-table-virtualized')).toBe(true)
    expect(container.querySelectorAll('tbody tr').length).toBeLessThan(100)
  })

  it('sorts the current data when no server sort handler is provided', () => {
    render()
    const firstBefore = container.querySelector('tbody tr .tanstack-table-cell')?.textContent
    const sort = container.querySelector<HTMLButtonElement>('button[aria-label="排序名称"]')
    act(() => sort?.click())
    const firstAfter = container.querySelector('tbody tr .tanstack-table-cell')?.textContent
    expect(firstBefore).toBe('甲')
    expect(firstAfter).toBe('乙')
  })

  it('reports sorting without reordering a server supplied page', () => {
    const onSortChange = vi.fn()
    act(() => root.render(createElement(TanstackTable<Row>, {
      columns,
      dataSource: rows,
      rowKey: (row) => row.id,
      onSortChange
    })))
    expect(onSortChange).not.toHaveBeenCalled()
    const sort = container.querySelector<HTMLButtonElement>('button[aria-label="排序名称"]')
    act(() => sort?.click())
    expect(onSortChange).toHaveBeenCalledTimes(1)
    expect(container.querySelector('tbody tr .tanstack-table-cell')?.textContent).toBe('甲')
  })

  it('keeps radio selection exclusive', () => {
    render('radio')
    const radios = container.querySelectorAll<HTMLInputElement>('input[type="radio"]')
    act(() => radios[0].click())
    expect(radios[0].checked).toBe(true)
    act(() => radios[1].click())
    expect(radios[0].checked).toBe(false)
    expect(radios[1].checked).toBe(true)
  })

  it('selects and clears the current page in checkbox mode', () => {
    render('checkbox')
    const checkboxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    act(() => checkboxes[0].click())
    expect(checkboxes[1].checked).toBe(true)
    expect(checkboxes[2].checked).toBe(true)
    act(() => checkboxes[0].click())
    expect(checkboxes[1].checked).toBe(false)
    expect(checkboxes[2].checked).toBe(false)
  })

  it('expands nested rows through the TanStack row model', () => {
    render(undefined, 'tree')
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2)
    const expand = container.querySelector<HTMLButtonElement>('button[aria-label="展开第 1 行"]')
    act(() => expand?.click())
    expect(container.querySelectorAll('tbody tr')).toHaveLength(3)
    expect(container.textContent).toContain('子项')
  })

  it('renders custom detail content in an expanded row', () => {
    render(undefined, 'detail')
    const expand = container.querySelector<HTMLButtonElement>('button[aria-label="展开第 1 行"]')
    act(() => expand?.click())
    expect(container.querySelector('.tanstack-table-expanded-row')?.textContent).toBe('子表格：甲')
  })

  it('can render a nested TanStack table in the expanded row', () => {
    act(() => root.render(createElement(TanstackTable<Row>, {
      columns,
      dataSource: rows,
      rowKey: (row) => row.id,
      renderExpandedRow: (row) => createElement(TanstackTable<Row>, {
        columns,
        dataSource: row.children ?? [],
        rowKey: (child) => child.id
      })
    })))
    const expand = container.querySelector<HTMLButtonElement>('button[aria-label="展开第 1 行"]')
    act(() => expand?.click())
    expect(container.querySelectorAll('table[aria-label="TanStack 数据列表"]')).toHaveLength(2)
    expect(container.querySelector('.tanstack-table-expanded-row')?.textContent).toContain('子项')
  })
})
