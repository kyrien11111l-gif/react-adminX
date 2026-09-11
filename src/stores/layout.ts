import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { SIDE_NAVIGATION } from '@/constants'
import type { NavigationStyle, ThemeMode } from '@/types'

const DEFAULT_WATERMARK_ENABLED =
  import.meta.env.VITE_WATERMARK_ENABLED === 'true'
const DEFAULT_WATERMARK_CONTENT = import.meta.env.VITE_WATERMARK_CONTENT?.trim() ?? ''

interface LayoutState {
  collapsed: boolean
  contentMaximized: boolean
  darkMode: boolean
  themeTransitioning: boolean
  themeMode: ThemeMode
  themeColorPrimary: string
  navigationStyle: NavigationStyle
  watermarkEnabled: boolean
  watermarkContent: string
  headerHeight: number
  pageTabsHeight: number
  setThemeMode: (themeMode: ThemeMode) => void
  setDarkMode: (darkMode: boolean) => void
  setThemeTransitioning: (transitioning: boolean) => void
  setThemeColorPrimary: (color: string) => void
  setNavigationStyle: (navigationStyle: NavigationStyle) => void
  setWatermarkEnabled: (enabled: boolean) => void
  setWatermarkContent: (content: string) => void
  setHeaderHeight: (height: number) => void
  setPageTabsHeight: (height: number) => void
  toggleCollapsed: () => void
  toggleContentMaximized: () => void
  toggleDarkMode: () => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      collapsed: false,
      contentMaximized: false,
      darkMode: false,
      themeTransitioning: false,
      themeMode: 'light',
      themeColorPrimary: '#1677ff',
      navigationStyle: SIDE_NAVIGATION,
      watermarkEnabled: DEFAULT_WATERMARK_ENABLED,
      watermarkContent: DEFAULT_WATERMARK_CONTENT,
      headerHeight: 56,
      pageTabsHeight: 35,
      setThemeMode: (themeMode) =>
        set((state) => ({
          themeMode,
          darkMode: themeMode === 'system' ? state.darkMode : themeMode === 'dark'
        })),
      setDarkMode: (darkMode) => set({ darkMode }),
      setThemeTransitioning: (themeTransitioning) =>
        set({ themeTransitioning }),
      setThemeColorPrimary: (themeColorPrimary) => set({ themeColorPrimary }),
      setNavigationStyle: (navigationStyle) => set({ navigationStyle }),
      setWatermarkEnabled: (watermarkEnabled) => set({ watermarkEnabled }),
      setWatermarkContent: (watermarkContent) => set({ watermarkContent }),
      setHeaderHeight: (headerHeight) => set({ headerHeight }),
      setPageTabsHeight: (pageTabsHeight) => set({ pageTabsHeight }),
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
      toggleContentMaximized: () =>
        set((state) => ({ contentMaximized: !state.contentMaximized })),
      toggleDarkMode: () =>
        set((state) => {
          const darkMode = !state.darkMode

          return {
            darkMode,
            themeMode: darkMode ? 'dark' : 'light'
          }
        })
    }),
    {
      name: 'admin-core-layout',
      storage: createJSONStorage(() => localStorage),
      partialize: ({
        collapsed,
        darkMode,
        themeMode,
        themeColorPrimary,
        navigationStyle,
        watermarkEnabled,
        watermarkContent
      }) => ({
        collapsed,
        darkMode,
        themeMode,
        themeColorPrimary,
        navigationStyle,
        watermarkEnabled,
        watermarkContent
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<LayoutState>

        return {
          ...currentState,
          ...persisted,
          themeMode:
            persisted.themeMode ??
            (persisted.darkMode ? 'dark' : currentState.themeMode)
        }
      }
    }
  )
)
