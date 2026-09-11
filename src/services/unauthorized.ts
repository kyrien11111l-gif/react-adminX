type UnauthorizedHandler = () => void | Promise<void>

let handler: UnauthorizedHandler | null = null
let handlingPromise: Promise<void> | null = null

export function registerUnauthorizedHandler(
  nextHandler: UnauthorizedHandler
): () => void {
  handler = nextHandler

  return () => {
    if (handler === nextHandler) {
      handler = null
    }
  }
}

export function handleUnauthorizedOnce(): Promise<void> {
  if (handlingPromise) {
    return handlingPromise
  }

  handlingPromise = Promise.resolve(handler?.()).finally(() => {
    window.setTimeout(() => {
      handlingPromise = null
    }, 500)
  })

  return handlingPromise
}
