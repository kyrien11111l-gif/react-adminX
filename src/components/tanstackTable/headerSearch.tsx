import { SearchOutlined } from '@ant-design/icons'
import { Button, Popover } from 'antd'
import { useState } from 'react'
import { TableHeaderSearchDropdown } from '@/components/tableHeaderSearch/dropdown'
import type { TanstackColumnSearch } from '@/components/tanstackTable/type'

export function HeaderSearch({
  title,
  search,
  loading
}: {
  title: string
  search: TanstackColumnSearch
  loading: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottom"
      content={<TableHeaderSearchDropdown
        key={search.value ?? ''}
        close={() => setOpen(false)}
        loading={loading}
        placeholder={search.placeholder ?? `请输入${title}`}
        value={search.value}
        onChange={search.onChange}
      />}
    >
      <Button
        type="text"
        size="small"
        icon={<SearchOutlined />}
        aria-label={`搜索${title}`}
        aria-pressed={Boolean(search.value)}
      />
    </Popover>
  )
}
