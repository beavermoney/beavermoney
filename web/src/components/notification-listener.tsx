import { useToast } from '@astryxdesign/core/Toast'
import { useEffect } from 'react'
export function NotificationListener() {
  const showToast = useToast()
  useEffect(() => {
    const listener = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail === 'string')
        showToast({ type: 'error', body: event.detail })
    }
    window.addEventListener('finance-notification', listener)
    return () => window.removeEventListener('finance-notification', listener)
  }, [showToast])
  return null
}
