import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false })

export function startRouteProgress() {
  NProgress.start()
}

export function finishRouteProgress() {
  NProgress.done()
}
