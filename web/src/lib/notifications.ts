type ErrorListener = (message: string) => void
const listeners = new Set<ErrorListener>()
const pending: string[] = []

export function notifyError(message: string) {
  if (!listeners.size) pending.push(message)
  else listeners.forEach((listener) => listener(message))
}

export function subscribeToErrors(listener: ErrorListener) {
  listeners.add(listener)
  pending.splice(0).forEach((message) => listener(message))
  return () => {
    listeners.delete(listener)
  }
}
