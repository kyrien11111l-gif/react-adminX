import { SearchOutlined } from '@ant-design/icons'
import { Button, Input, Space } from 'antd'
import type { InputRef } from 'antd'
import { useEffect, useRef, useState } from 'react'

export interface TableHeaderSearchOptions {
  loading?: boolean
  placeholder: string
  value?: string
  onChange: (value?: string) => void
}

interface TableHeaderSearchDropdownProps extends TableHeaderSearchOptions {
  close: () => void
}

export function TableHeaderSearchDropdown({
  close,
  loading,
  placeholder,
  value,
  onChange
}: TableHeaderSearchDropdownProps) {
  const [draftValue, setDraftValue] = useState(value ?? '')
  const inputRef = useRef<InputRef>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.select(), 0)

    return () => window.clearTimeout(timer)
  }, [])

  function handleSearch() {
    const nextValue = draftValue.trim()

    onChange(nextValue || undefined)
    close()
  }

  function handleReset() {
    setDraftValue('')
    onChange(undefined)
    close()
  }

  return (
    <div
      className="w-64 p-2"
      onKeyDown={(event) => event.stopPropagation()}
    >
      <Input
        ref={inputRef}
        allowClear
        aria-label={placeholder}
        disabled={loading}
        placeholder={placeholder}
        value={draftValue}
        onChange={(event) => setDraftValue(event.target.value)}
        onPressEnter={handleSearch}
      />
      <Space className="mt-2 w-full">
        <Button
          type="primary"
          icon={<SearchOutlined />}
          loading={loading}
          size="small"
          onClick={handleSearch}
        >
          查询
        </Button>
        <Button
          disabled={loading || (!draftValue && !value)}
          size="small"
          onClick={handleReset}
        >
          重置
        </Button>
      </Space>
    </div>
  )
}
