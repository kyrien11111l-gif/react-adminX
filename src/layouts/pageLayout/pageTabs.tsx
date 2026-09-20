import {
  CompressOutlined,
  ExpandOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import {
  Button,
  Dropdown,
  Space,
  Tabs,
  Tooltip
} from 'antd'
import type { MenuProps } from 'antd'
import type { TabsProps } from 'antd'
import { useEffect } from 'react'
import { useLocation, useMatches, useNavigate } from 'react-router-dom'
import { FORBIDDEN_PATH } from '@/router/config/constants'
import { isAppRouteHandle } from '@/router/routeHandle'
import { useLayoutStore, usePermissionStore, useTabsStore } from '@/stores'

const PAGE_TABS_CLASS_NAMES = {
  root: [
    'h-full',
    '[&.ant-tabs-card>.ant-tabs-nav]:m-0',
    '[&.ant-tabs-card>.ant-tabs-nav]:flex',
    '[&.ant-tabs-card>.ant-tabs-nav]:h-full',
    '[&.ant-tabs-card>.ant-tabs-nav]:min-h-0',
    '[&.ant-tabs-card>.ant-tabs-nav]:items-stretch',
    '[&.ant-tabs-card>.ant-tabs-nav]:p-0',
    '[&.ant-tabs-card>.ant-tabs-nav_.ant-tabs-ink-bar]:hidden',
    '[&.ant-tabs-card>.ant-tabs-nav_.ant-tabs-nav-list]:h-full',
    '[&.ant-tabs-card>.ant-tabs-nav_.ant-tabs-nav-list]:items-stretch',
    '[&.ant-tabs-card>.ant-tabs-nav_.ant-tabs-nav-wrap]:min-w-0',
    '[&.ant-tabs-card>.ant-tabs-nav]:before:hidden'
  ].join(' '),
  header: 'box-border',
  item: [
    '!relative',
    '!border-0',
    '!border-e',
    '!border-e-[var(--ant-color-border-secondary)]',
    '!transition-[color,background-color]',
    "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:bg-[var(--ant-color-primary)] after:content-[''] after:transition-transform",
    '[&.ant-tabs-tab-active]:after:scale-x-100'
  ].join(' '),
  body: '!hidden'
}

const PAGE_TABS_STYLES: TabsProps['styles'] = {
  item: {
    alignItems: 'center',
    background: 'transparent',
    boxSizing: 'border-box',
    borderRadius: 0,
    display: 'flex',
    alignSelf: 'stretch',
    height: '100%',
    margin: 0,
    paddingBlock: 0,
    paddingInline: 16
  },
  remove: {
    alignItems: 'center',
    display: 'inline-flex',
    height: 24,
    justifyContent: 'center',
    marginInlineStart: 4
  }
}

export function PageTabs() {
  const location = useLocation()
  const matches = useMatches()
  const navigate = useNavigate()
  const tabs = useTabsStore((state) => state.tabs)
  const addTab = useTabsStore((state) => state.addTab)
  const closeTab = useTabsStore((state) => state.closeTab)
  const closeOtherTabs = useTabsStore((state) => state.closeOtherTabs)
  const closeRightTabs = useTabsStore((state) => state.closeRightTabs)
  const closeAllTabs = useTabsStore((state) => state.closeAllTabs)
  const contentMaximized = useLayoutStore((state) => state.contentMaximized)
  const pageTabsHeight = useLayoutStore((state) => state.pageTabsHeight)
  const toggleContentMaximized = useLayoutStore(
    (state) => state.toggleContentMaximized
  )
  const homePath = usePermissionStore((state) => state.homePath)
  useEffect(() => {
    const currentMatch = [...matches]
      .reverse()
      .find((match) => isAppRouteHandle(match.handle) && match.handle.title)
    const title =
      isAppRouteHandle(currentMatch?.handle) && currentMatch.handle.title
        ? currentMatch.handle.title
        : location.pathname

    addTab({
      key: location.pathname,
      title,
      closable: location.pathname !== homePath
    })
  }, [addTab, homePath, location.pathname, matches])

  const handleClose = (key: string) => {
    const index = tabs.findIndex((tab) => tab.key === key)
    const fallback = tabs[index - 1] ?? tabs[index + 1]
    closeTab(key)
    if (key === location.pathname) {
      void navigate(fallback?.key ?? homePath ?? FORBIDDEN_PATH)
    }
  }

  const handleTabMenuClick = (action: string, targetKey: string) => {
    if (action === 'close-current') {
      handleClose(targetKey)
    } else if (action === 'close-other') {
      closeOtherTabs(targetKey)

      if (location.pathname !== targetKey) {
        void navigate(targetKey)
      }
    } else if (action === 'close-right') {
      const targetIndex = tabs.findIndex((tab) => tab.key === targetKey)
      const activeIndex = tabs.findIndex(
        (tab) => tab.key === location.pathname
      )

      closeRightTabs(targetKey)

      if (activeIndex > targetIndex) {
        void navigate(targetKey)
      }
    } else if (action === 'close-all') {
      closeAllTabs()
      void navigate(homePath ?? FORBIDDEN_PATH)
    }
  }

  const items: TabsProps['items'] = tabs.map((tab, index) => {
    const hasClosableOther = tabs.some(
      (item) => item.key !== tab.key && item.closable
    )
    const hasClosableRight = tabs
      .slice(index + 1)
      .some((item) => item.closable)
    const hasClosableTab = tabs.some((item) => item.closable)
    const menuItems: MenuProps['items'] = [
      {
        key: 'close-current',
        label: '关闭当前',
        disabled: !tab.closable
      },
      {
        key: 'close-other',
        label: '关闭其他',
        disabled: !hasClosableOther
      },
      {
        key: 'close-right',
        label: '关闭右边',
        disabled: !hasClosableRight
      },
      {
        key: 'close-all',
        label: '关闭全部',
        disabled: !hasClosableTab
      }
    ]

    return {
      key: tab.key,
      label: (
        <Dropdown
          trigger={['contextMenu']}
          menu={{
            items: menuItems,
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation()
              handleTabMenuClick(key, tab.key)
            }
          }}
        >
          <span
            className="-mx-4 flex items-center px-4"
            style={{ height: Math.max(pageTabsHeight - 2, 0) }}
          >
            {tab.title}
          </span>
        </Dropdown>
      ),
      closable: tab.closable
    }
  })

  return (
    <div
      className="box-border flex-none overflow-hidden pr-4 border-y border-y-[var(--ant-color-border-secondary)] bg-[var(--ant-color-bg-container)]"
      style={{ height: pageTabsHeight }}
    >
      <Tabs
        size="small"
        type="editable-card"
        hideAdd
        activeKey={location.pathname}
        items={items}
        tabBarGutter={0}
        classNames={PAGE_TABS_CLASS_NAMES}
        styles={PAGE_TABS_STYLES}
        onChange={(key) => void navigate(key)}
        onEdit={(targetKey, action) => {
          if (action === 'remove' && typeof targetKey === 'string') {
            handleClose(targetKey)
          }
        }}
        tabBarExtraContent={{
          right: (
            <Space.Compact className="flex h-full items-stretch [&_.ant-btn]:h-full [&_.ant-btn]:min-h-0 [&_.ant-btn]:min-w-8 [&_.ant-btn]:rounded-none [&_.ant-btn]:border-s [&_.ant-btn]:border-s-[var(--ant-color-border-secondary)]">
              <Tooltip title="刷新当前页">
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  aria-label="刷新当前页面"
                  onClick={() => window.location.reload()}
                />
              </Tooltip>
              <Tooltip title={contentMaximized ? '退出内容全屏' : '内容全屏'}>
                <Button
                  type="text"
                  icon={
                    contentMaximized ? <CompressOutlined /> : <ExpandOutlined />
                  }
                  aria-label={contentMaximized ? '退出内容全屏' : '内容全屏'}
                  onClick={toggleContentMaximized}
                />
              </Tooltip>
            </Space.Compact>
          )
        }}
      />
    </div>
  )
}
