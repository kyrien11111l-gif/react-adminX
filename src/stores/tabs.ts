import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { LayoutTab } from '@/types'

interface TabsState {
  tabs: LayoutTab[]
  setHomeTab: (tab: LayoutTab | null) => void
  addTab: (tab: LayoutTab) => void
  closeTab: (key: string) => void
  closeOtherTabs: (key: string) => void
  closeRightTabs: (key: string) => void
  closeAllTabs: () => void
  reset: () => void
}

export const useTabsStore = create<TabsState>()(
  persist(
    (set) => ({
      tabs: [],
      setHomeTab: (homeTab) =>
        set((state) => ({
          tabs: homeTab
            ? [
                homeTab,
                ...state.tabs.filter(
                  (tab) => tab.closable && tab.key !== homeTab.key
                )
              ]
            : []
        })),
      addTab: (tab) =>
        set((state) => {
          const existing = state.tabs.find((item) => item.key === tab.key)
          if (existing) {
            return {
              tabs: state.tabs.map((item) =>
                item.key === tab.key ? { ...item, ...tab } : item
              )
            }
          }
          return { tabs: [...state.tabs, tab] }
        }),
      closeTab: (key) =>
        set((state) => ({
          tabs: state.tabs.filter((tab) => tab.key !== key || !tab.closable)
        })),
      closeOtherTabs: (key) =>
        set((state) => ({
          tabs: state.tabs.filter((tab) => !tab.closable || tab.key === key)
        })),
      closeRightTabs: (key) =>
        set((state) => {
          const index = state.tabs.findIndex((tab) => tab.key === key)

          if (index < 0) {
            return state
          }

          return {
            tabs: state.tabs.filter(
              (tab, tabIndex) => tabIndex <= index || !tab.closable
            )
          }
        }),
      closeAllTabs: () =>
        set((state) => ({
          tabs: state.tabs.filter((tab) => !tab.closable)
        })),
      reset: () => set({ tabs: [] })
    }),
    {
      name: 'admin-core-tabs',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ tabs }) => ({ tabs })
    }
  )
)
