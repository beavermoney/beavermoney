import { useCallback } from 'react'
import {
  useCanGoBack,
  useRouter,
  type NavigateOptions,
} from '@tanstack/react-router'

/** Return to the actual origin, including its filters and browser history entry. */
export function useBackNavigation() {
  const router = useRouter()
  const canGoBack = useCanGoBack()
  return useCallback(
    (fallback: NavigateOptions) => {
      if (canGoBack) {
        router.history.back()
      } else {
        // A directly opened detail page has no in-app history to return to.
        // Replace it so Back cannot cycle between the detail and fallback.
        void router.navigate({ ...fallback, replace: true })
      }
    },
    [router, canGoBack],
  )
}
