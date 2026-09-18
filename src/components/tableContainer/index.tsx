import { Card } from 'antd'
import type { TableContainerProps } from '@/components/tableContainer/type'
import { joinClassNames } from '@/utils/classNames'

export type * from '@/components/tableContainer/type'

/* 表格容器统一负责伸缩布局和内容溢出处理。 */
const tableContainerClassName =
  'flex min-h-0 flex-1 flex-col overflow-hidden'
const tableContainerClassNames = {
  header: 'shrink-0',
  body: 'flex min-h-0 flex-1 flex-col overflow-hidden'
}

function mergeCardStyles(
  styles: TableContainerProps['styles']
): TableContainerProps['styles'] {
  if (typeof styles === 'function') {
    return (info) => {
      const resolvedStyles = styles(info)

      return {
        ...resolvedStyles,
        root: {
          ...resolvedStyles?.root,
          boxShadow: 'none'
        },
        header: {
          ...resolvedStyles?.header,
          borderBottom: 'none'
        },
        body: {
          ...resolvedStyles?.body,
          padding: 0
        }
      }
    }
  }

  return {
    ...styles,
    root: {
      ...styles?.root,
      boxShadow: 'none'
    },
    header: {
      ...styles?.header,
      borderBottom: 'none'
    },
    body: {
      ...styles?.body,
      padding: 0
    }
  }
}

function mergeCardClassNames(
  classNames: TableContainerProps['classNames']
): TableContainerProps['classNames'] {
  if (typeof classNames === 'function') {
    return (info) => ({
      ...tableContainerClassNames,
      ...classNames(info)
    })
  }

  return {
    ...tableContainerClassNames,
    ...classNames
  }
}

export function TableContainer({
  size = 'small',
  variant = 'borderless',
  className,
  classNames,
  styles,
  ...props
}: TableContainerProps) {
  return (
    <Card
      {...props}
      className={joinClassNames(tableContainerClassName, className)}
      classNames={mergeCardClassNames(classNames)}
      size={size}
      variant={variant}
      styles={mergeCardStyles(styles)}
    />
  )
}
