import {
  createExpandedRowModel,
  createSortedRowModel,
  rowExpandingFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Button, Checkbox, Empty, Pagination, Radio, Spin, theme, Typography } from 'antd'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type Key } from 'react'
import { ResizableHeaderCell } from '@/components/resizableTableHeader'
import type { TableColumnSetting } from '@/components/tableToolbar'
import { HeaderSearch } from '@/components/tanstackTable/headerSearch'
import type { TanstackColumn, TanstackTableProps } from '@/components/tanstackTable/type'
import '@/components/tanstackTable/style.css'

export type * from '@/components/tanstackTable/type'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
  rowExpandingFeature,
  expandedRowModel: createExpandedRowModel()
})

const VIRTUALIZATION_THRESHOLD = 100
const VIRTUALIZATION_OVERSCAN = 8
const INITIAL_VIRTUAL_RANGE = { start: 0, end: 24 }
const VIRTUAL_ROW_HEIGHTS = { small: 40, middle: 48, large: 56 } as const
const TABLE_PADDING_BY_SIZE = { small: '8px', middle: '12px', large: '16px' } as const
const DEFAULT_COLUMN_WIDTH = 160
const LEADING_COLUMN_WIDTH = 48
const MIN_COLUMN_WIDTH = 80
const MAX_COLUMN_WIDTH = 600
const SCROLL_EDGE_TOLERANCE = 1

function initialSettings<TData extends object>(columns: TanstackColumn<TData>[]): TableColumnSetting[] {
  return columns.map((column) => ({
    key: column.key,
    label: column.title,
    visible: true,
    fixed: column.fixed ?? false,
    width: column.width ?? DEFAULT_COLUMN_WIDTH,
    disabled: column.hideable === false
  }))
}

export function TanstackTable<TData extends object>({
  columns,
  dataSource,
  rowKey,
  loading = false,
  virtualize = false,
  pagination,
  rowSelection,
  size = 'middle',
  summary,
  columnSettings,
  onColumnSettingsChange,
  onSortChange,
  getSubRows,
  renderExpandedRow,
  rowExpandable
}: TanstackTableProps<TData>) {
  const { token } = theme.useToken()
  const [internalColumnSettings, setInternalColumnSettings] = useState(() => initialSettings(columns))
  const [internalSelection, setInternalSelection] = useState<Key[]>(rowSelection?.defaultSelectedRowKeys ?? [])
  const [scrollShadows, setScrollShadows] = useState({ left: false, right: false })
  const [virtualRange, setVirtualRange] = useState(INITIAL_VIRTUAL_RANGE)
  const scrollRef = useRef<HTMLDivElement>(null)
  const tableHeadRef = useRef<HTMLTableSectionElement>(null)
  const selectedRowKeys = rowSelection?.selectedRowKeys ?? internalSelection
  const selectedSet = useMemo(() => new Set(selectedRowKeys), [selectedRowKeys])
  const currentSettings = useMemo(() => {
    const available = new Set(columns.map((column) => column.key))
    const kept = (columnSettings ?? internalColumnSettings).filter((setting) => available.has(setting.key))
    const known = new Set(kept.map((setting) => setting.key))
    return [...kept, ...initialSettings(columns).filter((setting) => !known.has(setting.key))]
  }, [columnSettings, columns, internalColumnSettings])
  const visibleColumns = useMemo(() => {
    const byKey = new Map(columns.map((column) => [column.key, column]))
    return [
      ...currentSettings.filter((setting) => setting.fixed === 'left'),
      ...currentSettings.filter((setting) => setting.fixed === false),
      ...currentSettings.filter((setting) => setting.fixed === 'right')
    ].flatMap((setting) => {
      const column = byKey.get(setting.key)
      return setting.visible && column
        ? [{ ...column, fixed: setting.fixed, width: setting.width ?? column.width ?? DEFAULT_COLUMN_WIDTH }]
        : []
    })
  }, [columns, currentSettings])
  const definitions = useMemo<Array<ColumnDef<typeof features, TData>>>(() => visibleColumns.map((column) => ({
    id: column.key,
    accessorFn: (row) => column.accessor ? column.accessor(row) : row[column.key as keyof TData],
    header: column.title,
    enableSorting: column.sortable === true,
    cell: (info) => {
      const value = column.accessor
        ? column.accessor(info.row.original)
        : info.row.original[column.key as keyof TData]
      return column.render ? column.render(value as TData[keyof TData], info.row.original) : String(value ?? '')
    }
  })), [visibleColumns])
  const table = useTable({
    features,
    columns: definitions,
    data: dataSource,
    getSubRows,
    getRowCanExpand: rowExpandable ? (row) => rowExpandable(row.original) : renderExpandedRow ? () => true : undefined,
    manualSorting: Boolean(onSortChange)
  })
  const visibleRows = table.getRowModel().rows
  const visibleRowCount = visibleRows.length
  const hasExpansion = Boolean(getSubRows || renderExpandedRow)
  const virtualizeRows = virtualize && !hasExpansion && visibleRowCount >= VIRTUALIZATION_THRESHOLD
  const virtualRowHeight = VIRTUAL_ROW_HEIGHTS[size]
  const renderedRange = virtualizeRows
    ? virtualRange
    : { start: 0, end: visibleRowCount }
  const renderedRows = visibleRows.slice(renderedRange.start, renderedRange.end)
  const topSpacerHeight = virtualizeRows ? renderedRange.start * virtualRowHeight : 0
  const bottomSpacerHeight = virtualizeRows
    ? Math.max(0, visibleRowCount - renderedRange.end) * virtualRowHeight
    : 0
  const flatPageKeys = useMemo(() => dataSource.map(rowKey), [dataSource, rowKey])
  const flatSelectedOnPage = useMemo(() => flatPageKeys.filter((key) => selectedSet.has(key)), [flatPageKeys, selectedSet])
  const pageKeys = hasExpansion ? visibleRows.map((row) => rowKey(row.original)) : flatPageKeys
  const selectedOnPage = hasExpansion ? pageKeys.filter((key) => selectedSet.has(key)) : flatSelectedOnPage
  const allSelected = pageKeys.length > 0 && selectedOnPage.length === pageKeys.length
  const sorting = table.state.sorting
  const previousSorting = useRef(sorting)
  useEffect(() => {
    if (previousSorting.current !== sorting) {
      previousSorting.current = sorting
      onSortChange?.(sorting)
    }
  }, [onSortChange, sorting])
  const leadingWidth = (rowSelection ? LEADING_COLUMN_WIDTH : 0) + (hasExpansion ? LEADING_COLUMN_WIDTH : 0)
  const tableWidth = leadingWidth + visibleColumns.reduce((sum, column) => sum + (column.width ?? DEFAULT_COLUMN_WIDTH), 0)
  const lastLeftIndex = visibleColumns.reduce((last, column, index) => column.fixed === 'left' ? index : last, -1)
  const firstRightIndex = visibleColumns.findIndex((column) => column.fixed === 'right')
  const updateScrollShadows = useCallback(() => {
    const scroll = scrollRef.current
    if (!scroll) return
    const left = scroll.scrollLeft > SCROLL_EDGE_TOLERANCE
    const right = scroll.scrollLeft + scroll.clientWidth < scroll.scrollWidth - SCROLL_EDGE_TOLERANCE
    setScrollShadows((current) => current.left === left && current.right === right ? current : { left, right })
    if (!virtualizeRows) return
    const headerHeight = tableHeadRef.current?.offsetHeight ?? virtualRowHeight
    const bodyScrollTop = Math.max(0, scroll.scrollTop - headerHeight)
    const firstVisibleIndex = Math.floor(bodyScrollTop / virtualRowHeight)
    const visibleCount = Math.ceil(Math.max(0, scroll.clientHeight - headerHeight) / virtualRowHeight)
    const start = Math.min(visibleRowCount, Math.max(0, firstVisibleIndex - VIRTUALIZATION_OVERSCAN))
    const end = Math.max(start, Math.min(visibleRowCount, firstVisibleIndex + visibleCount + VIRTUALIZATION_OVERSCAN))
    setVirtualRange((current) => current.start === start && current.end === end ? current : { start, end })
  }, [virtualRowHeight, visibleRowCount, virtualizeRows])
  useEffect(() => {
    updateScrollShadows()
    const scroll = scrollRef.current
    if (!scroll || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(updateScrollShadows)
    observer.observe(scroll)
    return () => observer.disconnect()
  }, [tableWidth, updateScrollShadows])
  useEffect(() => {
    const scroll = scrollRef.current
    if (!scroll || !virtualizeRows) return
    scroll.scrollTop = 0
    updateScrollShadows()
  }, [dataSource, updateScrollShadows, virtualizeRows])
  const tableStyle = {
    '--tanstack-bg': token.colorBgContainer,
    '--tanstack-head-bg': token.colorFillAlter,
    '--tanstack-hover-bg': token.colorFillSecondary,
    '--tanstack-selected-bg': token.controlItemBgActive,
    '--tanstack-selected-hover-bg': token.controlItemBgActiveHover,
    '--tanstack-fixed-shadow': token.colorSplit,
    '--tanstack-border': token.colorBorderSecondary,
    '--tanstack-text': token.colorText,
    '--tanstack-text-secondary': token.colorTextSecondary,
    '--tanstack-row-height': `${virtualRowHeight}px`,
    '--tanstack-padding': TABLE_PADDING_BY_SIZE[size]
  } as CSSProperties

  function updateColumnSettings(settings: TableColumnSetting[]) {
    if (columnSettings === undefined) setInternalColumnSettings(settings)
    onColumnSettingsChange?.(settings)
  }

  function updateSelection(keys: Key[]) {
    if (rowSelection?.selectedRowKeys === undefined) setInternalSelection(keys)
    rowSelection?.onChange?.(keys)
  }

  function togglePage(checked: boolean) {
    updateSelection(checked
      ? [...selectedRowKeys, ...pageKeys.filter((key) => !selectedSet.has(key))]
      : selectedRowKeys.filter((key) => !pageKeys.includes(key)))
  }

  function pinnedStyle(index: number): CSSProperties | undefined {
    const column = visibleColumns[index]
    if (!column?.fixed) return undefined
    if (column.fixed === 'left') {
      return { left: leadingWidth + visibleColumns.slice(0, index).reduce((sum, item) => sum + (item.width ?? DEFAULT_COLUMN_WIDTH), 0) }
    }
    return { right: visibleColumns.slice(index + 1).reduce((sum, item) => sum + (item.width ?? DEFAULT_COLUMN_WIDTH), 0) }
  }

  function pinnedClass(index: number): string | undefined {
    const fixed = visibleColumns[index]?.fixed
    if (!fixed) return undefined
    const shadow = fixed === 'left' && index === lastLeftIndex && scrollShadows.left
      ? ' tanstack-table-shadow-left'
      : fixed === 'right' && index === firstRightIndex && scrollShadows.right
        ? ' tanstack-table-shadow-right'
        : ''
    return `tanstack-table-pinned${shadow}`
  }

  const leadingShadow = lastLeftIndex < 0 && scrollShadows.left ? ' tanstack-table-shadow-left' : ''

  return (
    <Spin spinning={loading} className="tanstack-table-spin">
      <div className="tanstack-table" style={tableStyle}>
        <div ref={scrollRef} onScroll={updateScrollShadows} className={`tanstack-table-scroll${visibleRowCount ? '' : ' tanstack-table-scroll-empty'}`}>
          <table
            aria-label="TanStack 数据列表"
            aria-rowcount={virtualizeRows ? visibleRowCount + 1 : undefined}
            className={virtualizeRows ? 'tanstack-table-virtualized' : undefined}
            style={{ minWidth: tableWidth }}
          >
            <colgroup>
              {hasExpansion && <col style={{ width: LEADING_COLUMN_WIDTH }} />}
              {rowSelection && <col style={{ width: LEADING_COLUMN_WIDTH }} />}
              {visibleColumns.map((column) => <col key={column.key} style={{ width: column.width }} />)}
            </colgroup>
            <thead ref={tableHeadRef}>
              {table.getHeaderGroups().map((group) => <tr key={group.id}>
                {hasExpansion && <th scope="col" className={`tanstack-table-leading${rowSelection ? '' : leadingShadow}`} style={{ left: 0 }} aria-label="展开行" />}
                {rowSelection && <th scope="col" className={`tanstack-table-selection tanstack-table-leading${leadingShadow}`} style={{ left: hasExpansion ? LEADING_COLUMN_WIDTH : 0 }}>
                  {rowSelection.type === 'checkbox' && <Checkbox
                    aria-label="选择当前页全部行"
                    checked={allSelected}
                    indeterminate={selectedOnPage.length > 0 && !allSelected}
                    disabled={!pageKeys.length}
                    onChange={(event) => togglePage(event.target.checked)}
                  />}
                </th>}
                {group.headers.map((header, index) => {
                  const column = visibleColumns[index]
                  const headerContext = {
                    column,
                    loading,
                    sortOrder: header.column.getIsSorted(),
                    toggleSorting: () => header.column.toggleSorting(),
                    search: column.search
                  }
                  const headerContent = column.renderHeader
                    ? column.renderHeader(headerContext)
                    : <span className="tanstack-table-heading">
                      {column.sortable ? column.renderSort ? column.renderSort(headerContext) : <Button
                        type="text"
                        size="small"
                        className="tanstack-table-sort"
                        aria-label={`排序${column.title}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >{column.title}{header.column.getIsSorted() === 'asc' ? ' ↑' : header.column.getIsSorted() === 'desc' ? ' ↓' : ''}</Button> : <span>{header.isPlaceholder ? null : <table.FlexRender header={header} />}</span>}
                      {column.search && (column.renderSearch ? column.renderSearch(headerContext) : <HeaderSearch title={column.title} search={column.search} loading={loading} />)}
                    </span>
                  return <ResizableHeaderCell
                    key={header.id}
                    scope="col"
                    aria-sort={column.sortable ? header.column.getIsSorted() === 'asc' ? 'ascending' : header.column.getIsSorted() === 'desc' ? 'descending' : 'none' : undefined}
                    className={pinnedClass(index)}
                    style={{ textAlign: column.align ?? 'left', ...pinnedStyle(index) }}
                    width={column.width}
                    minWidth={MIN_COLUMN_WIDTH}
                    maxWidth={MAX_COLUMN_WIDTH}
                    resizeLabel={`${column.title}列`}
                    onColumnResize={column.resizable === false || columnSettings !== undefined && !onColumnSettingsChange ? undefined : (width) => updateColumnSettings(currentSettings.map((setting) => setting.key === column.key ? { ...setting, width } : setting))}
                  >
                    {headerContent}
                  </ResizableHeaderCell>
                })}
              </tr>)}
            </thead>
            <tbody>
              {topSpacerHeight > 0 && <tr aria-hidden="true" className="tanstack-table-virtual-spacer">
                <td colSpan={visibleColumns.length + (rowSelection ? 1 : 0)} style={{ height: topSpacerHeight }} />
              </tr>}
              {renderedRows.map((row, rowIndex) => {
                const key = rowKey(row.original)
                return <Fragment key={String(key)}>
                  <tr
                    aria-rowindex={virtualizeRows ? renderedRange.start + rowIndex + 2 : undefined}
                    className={selectedSet.has(key) ? 'is-selected' : undefined}
                  >
                    {hasExpansion && <td className={`tanstack-table-leading${rowSelection ? '' : leadingShadow}`} style={{ left: 0 }}>
                      {row.getCanExpand() && <Button
                        type="text"
                        size="small"
                        aria-label={`${row.getIsExpanded() ? '收起' : '展开'}第 ${row.index + 1} 行`}
                        aria-expanded={row.getIsExpanded()}
                        onClick={() => row.toggleExpanded()}
                      >{row.getIsExpanded() ? '−' : '+'}</Button>}
                    </td>}
                    {rowSelection && <td className={`tanstack-table-selection tanstack-table-leading${leadingShadow}`} style={{ left: hasExpansion ? LEADING_COLUMN_WIDTH : 0 }}>
                      {rowSelection.type === 'radio' ? <Radio
                        aria-label={`选择第 ${row.index + 1} 行`}
                        checked={selectedSet.has(key)}
                        onChange={() => updateSelection([key])}
                      /> : <Checkbox
                        aria-label={`选择第 ${row.index + 1} 行`}
                        checked={selectedSet.has(key)}
                        onChange={(event) => updateSelection(event.target.checked
                          ? [...selectedRowKeys, key]
                          : selectedRowKeys.filter((item) => item !== key))}
                      />}
                    </td>}
                    {row.getAllCells().map((cell, index) => <td
                      key={cell.id}
                      className={pinnedClass(index)}
                      style={{ textAlign: visibleColumns[index]?.align ?? 'left', ...pinnedStyle(index) }}
                    >
                      <div className="tanstack-table-cell" style={index === 0 && row.depth ? { paddingInlineStart: row.depth * 20 } : undefined}>
                        <table.FlexRender cell={cell} />
                      </div>
                    </td>)}
                  </tr>
                  {renderExpandedRow && row.getIsExpanded() && <tr className="tanstack-table-expanded-row">
                    <td colSpan={visibleColumns.length + (rowSelection ? 1 : 0) + (hasExpansion ? 1 : 0)}>{renderExpandedRow(row.original)}</td>
                  </tr>}
                </Fragment>
              })}
              {bottomSpacerHeight > 0 && <tr aria-hidden="true" className="tanstack-table-virtual-spacer">
                <td colSpan={visibleColumns.length + (rowSelection ? 1 : 0)} style={{ height: bottomSpacerHeight }} />
              </tr>}
            </tbody>
          </table>
          {!visibleRowCount && <div className="tanstack-table-empty"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" /></div>}
        </div>
      {summary && <div className="tanstack-table-summary">{summary}</div>}
      {pagination && <div className="tanstack-table-pagination">
        <Typography.Text type="secondary">共 {pagination.total ?? 0} 条</Typography.Text>
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          pageSizeOptions={pagination.pageSizeOptions}
          showQuickJumper={pagination.showQuickJumper}
          showSizeChanger={pagination.showSizeChanger}
          responsive
          onChange={pagination.onChange}
        />
      </div>}
      </div>
    </Spin>
  )
}
