import type { TableProps } from 'antd'
import { ResizableHeaderCell } from '@/components/resizableTableHeader'

export function getResizableTableComponents<RecordType extends object>(
  customComponents?: TableProps<RecordType>['components']
): NonNullable<TableProps<RecordType>['components']> {
  const defaultComponents: NonNullable<
    TableProps<RecordType>['components']
  > = {
    header: {
      cell: ResizableHeaderCell
    }
  }

  return {
    ...defaultComponents,
    ...customComponents,
    header: {
      ...defaultComponents.header,
      ...customComponents?.header
    }
  }
}
