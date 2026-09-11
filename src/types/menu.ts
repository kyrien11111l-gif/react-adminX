export interface AppRouteMeta {
  title?: string
  icon?: string
  hidden?: boolean
  layout?: 'default' | 'fullpage'
  permission?: string
  keepAlive?: boolean
  rank?: number
  affix?: boolean
  link?: string
  iframe?: string
}

// A distinct named boundary keeps custom React Router handles consistent across the app.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AppRouteHandle extends AppRouteMeta {}

export interface Menu {
  id: string
  name: string
  path: string
  component?: string
  children?: Menu[]
  meta?: AppRouteMeta
}
