import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { useEffect, useRef } from 'react'
import { Button } from '@astryxdesign/core/Button'
import { useToast } from '@astryxdesign/core/Toast'
import { useRegisterSW } from 'virtual:pwa-register/react'

const MIN_UPDATE_CHECK_INTERVAL_MS = 60_000
const UPDATE_TOAST_ID = 'pwa-update-available'

export function PwaUpdatePrompt() {
  const { t } = useLingui()
  const showToast = useToast()
  const registrationRef = useRef<ServiceWorkerRegistration>(null)
  const lastUpdateCheckRef = useRef(0)
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW: (_serviceWorkerUrl, registration) => {
      registrationRef.current = registration ?? null
      lastUpdateCheckRef.current = Date.now()
    },
  })

  useEffect(() => {
    const checkForUpdate = () => {
      const registration = registrationRef.current
      const now = Date.now()

      if (
        document.visibilityState !== 'visible' ||
        !navigator.onLine ||
        !registration ||
        registration.installing ||
        now - lastUpdateCheckRef.current < MIN_UPDATE_CHECK_INTERVAL_MS
      ) {
        return
      }

      lastUpdateCheckRef.current = now
      void registration.update().catch(() => {
        // A failed update check is expected while connectivity is changing.
        // The next launch, foreground, or online event will try again.
      })
    }

    document.addEventListener('visibilitychange', checkForUpdate)
    window.addEventListener('online', checkForUpdate)

    return () => {
      document.removeEventListener('visibilitychange', checkForUpdate)
      window.removeEventListener('online', checkForUpdate)
    }
  }, [])

  useEffect(() => {
    if (!needRefresh) return
    const hide = showToast({
      uniqueID: UPDATE_TOAST_ID,
      body: t`Update available. Reload to use the latest version of Beaver Money.`,
      isAutoHide: false,
      onHide: () => setNeedRefresh(false),
      endContent: (
        <Button
          label={t`Update`}
          size="sm"
          onClick={() => void updateServiceWorker(true)}
        >
          <Trans>Update</Trans>
        </Button>
      ),
    })
    return hide
  }, [t, needRefresh, setNeedRefresh, updateServiceWorker, showToast])
  return null
}
