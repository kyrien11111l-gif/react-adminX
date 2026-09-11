import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  MoonOutlined,
  SettingOutlined,
  SunOutlined
} from '@ant-design/icons'
import { App, Button, Tooltip } from 'antd'
import { type CSSProperties, type MouseEvent } from 'react'
import { useFullscreen } from '@/hooks'
import { useLayoutStore } from '@/stores'
import { UserMenu } from '@/layouts/pageLayout/userMenu'
import { transitionToTheme } from '@/utils/themeTransition'

const ICONS_SIZE = {
  fontSize: 16
} as CSSProperties

interface HeaderActionsProps {
  onOpenSettings: () => void
}

export function HeaderActions({ onOpenSettings }: HeaderActionsProps) {
  const { message } = App.useApp()
  const darkMode = useLayoutStore((state) => state.darkMode)
  const themeTransitioning = useLayoutStore(
    (state) => state.themeTransitioning
  )
  const { isFullscreen, toggleFullscreen } = useFullscreen()

  const toggleTheme = (event: MouseEvent<HTMLElement>) => {
    const nextTheme = darkMode ? 'light' : 'dark'
    transitionToTheme(nextTheme, event)
  }

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <Tooltip title={darkMode ? '切换到浅色模式' : '切换到深色模式'}>
        <Button
          type="text"
          icon={darkMode ? <SunOutlined style={ICONS_SIZE}/> : <MoonOutlined style={ICONS_SIZE}/>}
          aria-label={darkMode ? '切换到浅色模式' : '切换到深色模式'}
          disabled={themeTransitioning}
          onClick={toggleTheme}
        />
      </Tooltip>
      <Tooltip title="布局设置">
        <Button
          type="text"
          icon={<SettingOutlined style={ICONS_SIZE} />}
          aria-label="打开布局设置"
          onClick={onOpenSettings}
        />
      </Tooltip>
      <Tooltip title={isFullscreen ? '退出全屏' : '全屏'}>
        <Button
          type="text"
          icon={
            isFullscreen ? (
              <FullscreenExitOutlined style={ICONS_SIZE} />
            ) : (
              <FullscreenOutlined style={ICONS_SIZE} />
            )
          }
          aria-label={isFullscreen ? '退出全屏' : '进入全屏'}
          onClick={() =>
            void toggleFullscreen().catch(() => {
              void message.error('浏览器未允许进入全屏模式')
            })
          }
        />
      </Tooltip>
      <UserMenu />
    </div>
  )
}
