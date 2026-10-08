import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false, speed: 600, easing: 'ease' })

export function startRouteProgress() {
  NProgress.start()
}

export function finishRouteProgress() {
  NProgress.done()
}
