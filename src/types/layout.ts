export interface LayoutTab {
  key: string
  title: string
  closable: boolean
}

export type ThemeMode = 'light' | 'dark' | 'system'

export type NavigationStyle =
  | 'side-navigation'
  | 'top-navigation'
  | 'two-column-navigation'
  | 'mixed-navigation'

export interface MenuPathEntry {
  key: string
  ancestors: string[]
  link?: string
  iframe?: string
}
