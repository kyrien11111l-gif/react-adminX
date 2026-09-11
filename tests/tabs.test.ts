import { beforeEach, describe, expect, it } from 'vitest'
import { useTabsStore } from '@/stores'

describe('tabs store', () => {
  beforeEach(() => {
    localStorage.clear()
    useTabsStore.getState().reset()
  })

  it('persists all opened tabs', () => {
    useTabsStore.getState().addTab({
      key: '/system/user',
      title: '用户管理',
      closable: true
    })
    useTabsStore.getState().addTab({
      key: '/system/role',
      title: '角色管理',
      closable: true
    })

    const storedTabs = JSON.parse(
      localStorage.getItem('admin-core-tabs') ?? '{}'
    ) as {
      state?: { tabs?: unknown[] }
    }

    expect(storedTabs.state?.tabs).toHaveLength(3)
  })

  it('closes only closable tabs on the right', () => {
    const store = useTabsStore.getState()
    store.addTab({
      key: '/system/user',
      title: '用户管理',
      closable: true
    })
    store.addTab({
      key: '/system/role',
      title: '角色管理',
      closable: true
    })
    store.addTab({
      key: '/system/audit',
      title: '审计记录',
      closable: true
    })

    useTabsStore.getState().closeRightTabs('/system/user')

    expect(useTabsStore.getState().tabs.map((tab) => tab.key)).toEqual([
      '/dashboard',
      '/system/user'
    ])
  })
})
