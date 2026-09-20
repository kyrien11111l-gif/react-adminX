import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { PageLayout } from '@/layouts/pageLayout'
import { WHITE_LIST_TEST_ROUTE_PATH } from '@/router/config/constants'

const LoginPage = lazy(() => import('@/pages/login'))
const WhiteListPage = lazy(() => import('@/pages/whiteList'))
const ForbiddenPage = lazy(() => import('@/pages/error/403'))
const NotFoundPage = lazy(() => import('@/pages/error/404'))

export const baseRoutes: RouteObject[] = [
  {
    path: '403',
    Component: PageLayout,
    handle: {
      title: '403'
    },
    children: [
      {
        index: true,
        Component: ForbiddenPage
      }
    ]
  },
  {
    path: 'login',
    Component: LoginPage
  },
  {
    path: WHITE_LIST_TEST_ROUTE_PATH,
    Component: WhiteListPage
  },
  {
    path: '*',
    Component: NotFoundPage
  }
]
