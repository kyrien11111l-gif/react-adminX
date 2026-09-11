import {
  ColumnHeightOutlined,
  HolderOutlined,
  PushpinOutlined,
  ReloadOutlined,
  SettingOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined
} from '@ant-design/icons'
import {
  Button,
  Checkbox,
  Dropdown,
  Popover,
  Space,
  Tooltip,
  Typography
} from 'antd'
import type { DragEvent, KeyboardEvent } from 'react'
import { useState } from 'react'
import type {
  TableColumnFixed,
  TableColumnSetting,
  TableDensity,
  TableToolbarProps
} from '@/components/tableToolbar/type'

export type * from '@/components/tableToolbar/type'

const densityOptions: Array<{ key: TableDensity; label: string }> = [
  { key: 'large', label: '宽松' },
  { key: 'medium', label: '中等' },
  { key: 'small', label: '紧凑' }
]

function TableDensityMenu({
  density,
  onChange
}: {
  density: TableDensity
  onChange: (density: TableDensity) => void
}) {
  return (
    <Dropdown
      menu={{
        items: densityOptions.map((option) => ({
          key: option.key,
          label: option.label,
          style:
            option.key === density
              ? {
                  backgroundColor: 'var(--ant-color-error-bg)',
                  color: 'var(--ant-color-error)'
                }
              : undefined
        })),
        selectedKeys: [density],
        onClick: ({ key }) => onChange(key as TableDensity)
      }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Tooltip title="表格密度">
        <Button
          type="text"
          icon={<ColumnHeightOutlined />}
          aria-label="设置表格密度"
        />
      </Tooltip>
    </Dropdown>
  )
}

function getFixedLabel(fixed: TableColumnFixed) {
  if (fixed === 'left') {
    return '固定在左侧'
  }

  if (fixed === 'right') {
    return '固定在右侧'
  }

  return '不固定'
}

function getGroupedSettings(settings: TableColumnSetting[]) {
  const groups = [
    {
      fixed: false as const,
      label: '不固定',
      items: settings.filter((setting) => setting.fixed === false)
    },
    {
      fixed: 'left' as const,
      label: '固定在左侧',
      items: settings.filter((setting) => setting.fixed === 'left')
    },
    {
      fixed: 'right' as const,
      label: '固定在右侧',
      items: settings.filter((setting) => setting.fixed === 'right')
    }
  ]

  return groups.filter((group) => group.items.length > 0)
}

function ColumnSettings({
  settings,
  onChange,
  onReset
}: {
  settings: TableColumnSetting[]
  onChange: (settings: TableColumnSetting[]) => void
  onReset?: () => void
}) {
  const [draggingKey, setDraggingKey] = useState<string>()

  function updateSetting(
    key: string,
    update: Partial<TableColumnSetting>
  ) {
    onChange(
      settings.map((setting) =>
        setting.key === key ? { ...setting, ...update } : setting
      )
    )
  }

  function moveSetting(sourceKey: string, targetKey: string) {
    if (sourceKey === targetKey) {
      return
    }

    const sourceIndex = settings.findIndex(
      (setting) => setting.key === sourceKey
    )
    const targetIndex = settings.findIndex(
      (setting) => setting.key === targetKey
    )

    if (
      sourceIndex < 0 ||
      targetIndex < 0 ||
      settings[sourceIndex].fixed !== settings[targetIndex].fixed
    ) {
      return
    }

    const nextSettings = [...settings]
    const [sourceSetting] = nextSettings.splice(sourceIndex, 1)
    const insertIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
    nextSettings.splice(insertIndex, 0, sourceSetting)
    onChange(nextSettings)
  }

  function moveSettingByOffset(key: string, offset: -1 | 1) {
    const currentIndex = settings.findIndex((setting) => setting.key === key)
    const currentSetting = settings[currentIndex]

    if (!currentSetting) {
      return
    }

    const sameGroup = settings.filter(
      (setting) => setting.fixed === currentSetting.fixed
    )
    const groupIndex = sameGroup.findIndex((setting) => setting.key === key)
    const targetSetting = sameGroup[groupIndex + offset]

    if (targetSetting) {
      moveSetting(key, targetSetting.key)
    }
  }

  function handleDragStart(key: string, event: DragEvent<HTMLDivElement>) {
    setDraggingKey(key)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', key)
  }

  function handleDrop(targetKey: string, event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    const sourceKey = draggingKey ?? event.dataTransfer.getData('text/plain')

    if (sourceKey) {
      moveSetting(sourceKey, targetKey)
    }
    setDraggingKey(undefined)
  }

  function handleKeyDown(key: string, event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return
    }

    event.preventDefault()
    moveSettingByOffset(key, event.key === 'ArrowUp' ? -1 : 1)
  }

  const groupedSettings = getGroupedSettings(settings)

  return (
    <Popover
      content={
        <div className="w-72">
          {groupedSettings.map((group) => (
            <div key={group.label} className="mb-3 last:mb-0">
              <Typography.Text type="secondary" className="text-xs">
                {group.label}
              </Typography.Text>
              <div className="mt-1">
                {group.items.map((setting) => (
                    <div
                      key={setting.key}
                      draggable
                      className="flex min-h-8 items-center gap-1 rounded px-1 hover:bg-[var(--ant-color-fill-tertiary)]"
                      onDragStart={(event) =>
                        handleDragStart(setting.key, event)
                      }
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => handleDrop(setting.key, event)}
                      onDragEnd={() => setDraggingKey(undefined)}
                      onKeyDown={(event) => handleKeyDown(setting.key, event)}
                      tabIndex={0}
                      aria-label={`拖动排序${String(setting.label)}`}
                    >
                      <HolderOutlined
                        className="cursor-grab text-[var(--ant-color-text-quaternary)]"
                        aria-hidden
                      />
                      <Checkbox
                        checked={setting.visible}
                        disabled={setting.disabled}
                        onChange={(event) =>
                          updateSetting(setting.key, {
                            visible: event.target.checked
                          })
                        }
                      >
                        <span className="inline-block max-w-36 truncate align-bottom">
                          {setting.label}
                        </span>
                      </Checkbox>
                      <Space size={0} className="ml-auto shrink-0">
                        {setting.fixed === false ? (
                          <>
                            <Tooltip title="固定到左侧">
                              <Button
                                type="text"
                                size="small"
                                icon={<VerticalAlignTopOutlined />}
                                aria-label={`将${String(setting.label)}固定到左侧`}
                                onClick={() =>
                                  updateSetting(setting.key, { fixed: 'left' })
                                }
                              />
                            </Tooltip>
                            <Tooltip title="固定到右侧">
                              <Button
                                type="text"
                                size="small"
                                icon={<VerticalAlignBottomOutlined />}
                                aria-label={`将${String(setting.label)}固定到右侧`}
                                onClick={() =>
                                  updateSetting(setting.key, { fixed: 'right' })
                                }
                              />
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title={`取消${getFixedLabel(setting.fixed)}`}>
                            <Button
                              type="text"
                              size="small"
                              icon={<PushpinOutlined />}
                              aria-label={`取消${getFixedLabel(setting.fixed)}`}
                              onClick={() =>
                                updateSetting(setting.key, { fixed: false })
                              }
                            />
                          </Tooltip>
                        )}
                      </Space>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      }
      title={
        <div className="flex justify-end">
          <Button type="link" danger size="small" onClick={onReset}>
            重置
          </Button>
        </div>
      }
      placement="bottomRight"
      trigger="click"
    >
      <Tooltip title="列设置">
        <Button
          type="text"
          icon={<SettingOutlined />}
          aria-label="设置表格列"
        />
      </Tooltip>
    </Popover>
  )
}

export function TableToolbar({
  title,
  actions,
  extra,
  onRefresh,
  refreshing = false,
  density,
  onDensityChange,
  columnSettings,
  onColumnSettingsChange,
  onColumnSettingsReset
}: TableToolbarProps) {
  const canConfigureColumns =
    columnSettings && columnSettings.length > 0 && onColumnSettingsChange

  return (
    <div className="flex min-h-12 w-full min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        {title ? (
          <div className="min-w-0 truncate text-base font-semibold">{title}</div>
        ) : null}
        {actions ? <Space size="small">{actions}</Space> : null}
      </div>

      <Space size="small" className="shrink-0">
        {extra}
        {onRefresh ? (
          <Tooltip title="刷新">
            <Button
              type="text"
              icon={<ReloadOutlined />}
              loading={refreshing}
              aria-label="刷新表格"
              onClick={() => void onRefresh()}
            />
          </Tooltip>
        ) : null}
        {density && onDensityChange ? (
          <TableDensityMenu density={density} onChange={onDensityChange} />
        ) : null}
        {canConfigureColumns ? (
          <ColumnSettings
            settings={columnSettings}
            onChange={onColumnSettingsChange}
            onReset={onColumnSettingsReset}
          />
        ) : null}
      </Space>
    </div>
  )
}
