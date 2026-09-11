import {
  Button,
  ColorPicker,
  Divider,
  Drawer,
  Input,
  Switch,
  Typography
} from 'antd'
import type { MouseEvent } from 'react'
import { useLayoutStore } from '@/stores'
import {
  MIXED_NAVIGATION,
  SIDE_NAVIGATION,
  TOP_NAVIGATION,
  TWO_COLUMN_NAVIGATION
} from '@/constants'
import type { NavigationStyle, ThemeMode } from '@/types'
import { transitionToTheme } from '@/utils/themeTransition'

interface SettingsDrawerProps {
  open: boolean
  onClose: () => void
}

const navigationOptions: Array<{
  label: string
  value: NavigationStyle
}> = [
  { label: '侧边导航', value: SIDE_NAVIGATION },
  { label: '顶部导航', value: TOP_NAVIGATION },
  { label: '双列导航', value: TWO_COLUMN_NAVIGATION },
  { label: '混合导航', value: MIXED_NAVIGATION }
]

const themeOptions: Array<{
  label: string
  value: ThemeMode
}> = [
  { label: '浅色', value: 'light' },
  { label: '暗黑', value: 'dark' },
  { label: '跟随系统', value: 'system' }
]

export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const navigationStyle = useLayoutStore((state) => state.navigationStyle)
  const setNavigationStyle = useLayoutStore(
    (state) => state.setNavigationStyle
  )
  const themeMode = useLayoutStore((state) => state.themeMode)
  const themeTransitioning = useLayoutStore(
    (state) => state.themeTransitioning
  )
  const setThemeMode = useLayoutStore((state) => state.setThemeMode)
  const themeColorPrimary = useLayoutStore(
    (state) => state.themeColorPrimary
  )
  const setThemeColorPrimary = useLayoutStore(
    (state) => state.setThemeColorPrimary
  )
  const watermarkEnabled = useLayoutStore(
    (state) => state.watermarkEnabled
  )
  const setWatermarkEnabled = useLayoutStore(
    (state) => state.setWatermarkEnabled
  )
  const watermarkContent = useLayoutStore(
    (state) => state.watermarkContent
  )
  const setWatermarkContent = useLayoutStore(
    (state) => state.setWatermarkContent
  )

  const handleThemeModeChange = (
    nextTheme: ThemeMode,
    event: MouseEvent<HTMLElement>
  ) => {
    if (themeTransitioning) return

    if (nextTheme === 'system') {
      setThemeMode(nextTheme)
      return
    }

    transitionToTheme(nextTheme, event)
  }

  return (
    <Drawer
      title="布局设置"
      placement="right"
      size={360}
      open={open}
      onClose={onClose}
    >
      <div className="space-y-6">
        <section className="space-y-3">
          <Typography.Title level={5} className="m-0">
            导航布局
          </Typography.Title>
          <div className="flex w-full flex-nowrap gap-2">
            {navigationOptions.map((option) => (
              <Button
                key={option.value}
                type={navigationStyle === option.value ? 'primary' : 'default'}
                aria-pressed={navigationStyle === option.value}
                className="min-w-0 flex-1 !px-1 whitespace-nowrap"
                onClick={() => setNavigationStyle(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </section>

        <Divider className="my-0" />

        <section className="space-y-3">
          <Typography.Title level={5} className="m-0">
            主题模式
          </Typography.Title>
          <div className="flex w-full flex-nowrap gap-2">
            {themeOptions.map((option) => (
              <Button
                key={option.value}
                type={themeMode === option.value ? 'primary' : 'default'}
                aria-pressed={themeMode === option.value}
                disabled={themeTransitioning}
                className="min-w-0 flex-1 !px-1 whitespace-nowrap"
                onClick={(event) =>
                  handleThemeModeChange(option.value, event)
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
        </section>

        <Divider className="my-0" />

        <section className="space-y-3">
          <Typography.Title level={5} className="m-0">
            主题色
          </Typography.Title>
          <div className="flex items-center justify-between gap-4">
            <Typography.Text type="secondary">Ant Design 主色</Typography.Text>
            <ColorPicker
              value={themeColorPrimary}
              showText
              format="hex"
              onChangeComplete={(color) =>
                setThemeColorPrimary(color.toHexString())
              }
            />
          </div>
        </section>

        <Divider className="my-0" />

        <section className="space-y-3">
          <Typography.Title level={5} className="m-0">
            通用设置
          </Typography.Title>
          <div className="flex items-center justify-between gap-4">
            <Typography.Text>开启水印</Typography.Text>
            <Switch
              checked={watermarkEnabled}
              onChange={setWatermarkEnabled}
            />
          </div>
          <div className="space-y-2">
            <Typography.Text>水印文字</Typography.Text>
            <Input
              value={watermarkContent}
              disabled={!watermarkEnabled}
              aria-label="水印内容"
              placeholder="请输入水印内容"
              onChange={(event) => setWatermarkContent(event.target.value)}
            />
          </div>
        </section>
      </div>
    </Drawer>
  )
}
