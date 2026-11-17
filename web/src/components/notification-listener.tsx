import { subscribeToErrors } from '@/lib/notifications'
import { useToast } from '@astryxdesign/core/Toast'
import { useCallback, type ReactNode } from 'react'

// Bind the notification service to the mounted application/toast surface.
export function NotificationListener({ children }: { children: ReactNode }) {
  const showToast = useToast()
  const attach = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return
      return subscribeToErrors((message) =>
        showToast({ type: 'error', body: message }),
      )
    },
    [showToast],
  )
  return (
    <section className="contents" ref={attach}>
      {children}
    </section>
  )
}
