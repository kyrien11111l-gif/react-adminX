import { Typography } from 'antd'
import type { ComponentProps, ReactNode } from 'react'
import { joinClassNames } from '@/utils/classNames'

type ParagraphProps = ComponentProps<typeof Typography.Paragraph>
type EllipsisConfig = Exclude<ParagraphProps['ellipsis'], boolean | undefined>

export interface EllipsisParagraphProps
  extends Omit<ParagraphProps, 'ellipsis'> {
  rows?: number
  tooltip?: EllipsisConfig['tooltip']
  copyText?: string
  ellipsis?: ParagraphProps['ellipsis']
}

function getPlainText(value: ReactNode): string {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'bigint'
  ) {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.map(getPlainText).join('')
  }

  return ''
}

export function EllipsisParagraph({
  children,
  className,
  copyText,
  copyable,
  ellipsis,
  rows = 1,
  style,
  tooltip,
  ...restProps
}: EllipsisParagraphProps) {
  const plainText = getPlainText(children)
  const ellipsisConfig = typeof ellipsis === 'object' ? ellipsis : undefined
  const resolvedEllipsis =
    ellipsis === false
      ? false
      : {
          ...ellipsisConfig,
          rows: ellipsisConfig?.rows ?? rows,
          tooltip: tooltip ?? ellipsisConfig?.tooltip ?? (plainText || undefined)
        }
  const resolvedCopyable =
    copyable === true
      ? {
          text: copyText ?? plainText,
          tooltips: ['复制', '复制成功']
        }
      : typeof copyable === 'object' && copyable !== null
        ? {
            tooltips: ['复制', '复制成功'],
            ...copyable,
            ...(copyText === undefined ? {} : { text: copyText })
        }
        : copyable

  return (
    <Typography.Paragraph
      {...restProps}
      className={joinClassNames('ellipsis-paragraph', className)}
      copyable={resolvedCopyable}
      ellipsis={resolvedEllipsis}
      style={{
        marginBlockEnd: 0,
        minWidth: 0,
        width: '100%',
        textAlign: 'inherit',
        ...style
      }}
    >
      {children}
    </Typography.Paragraph>
  )
}
