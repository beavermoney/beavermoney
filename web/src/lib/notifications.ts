export function notifyError(message: string) {
  window.dispatchEvent(
    new CustomEvent('finance-notification', { detail: message }),
  )
}
