import { SearchOutlined } from '@ant-design/icons'
import type { TableColumnType } from 'antd'
import {
  TableHeaderSearchDropdown,
  type TableHeaderSearchOptions
} from '@/components/tableHeaderSearch/dropdown'

export function getTableHeaderSearchProps<RecordType>({
  loading,
  placeholder,
  value,
  onChange
}: TableHeaderSearchOptions): Pick<
  TableColumnType<RecordType>,
  'filteredValue' | 'filterDropdown' | 'filterIcon'
> {
  return {
    filteredValue: value ? [value] : null,
    filterDropdown: ({ close }) => (
      <TableHeaderSearchDropdown
        key={value ?? ''}
        close={close}
        loading={loading}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        aria-label={filtered ? '已设置表头查询条件' : '打开表头查询'}
      />
    )
  }
}
