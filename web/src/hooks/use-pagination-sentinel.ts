import { useCallback } from 'react'

// Reobserve after each completed page: a sentinel that stays visible must
// continue filling the viewport, without waiting for a second scroll event.
export function usePaginationSentinel({
  enabled,
  onLoadMore,
  root = null,
  rootMargin = '0px',
}: {
  enabled: boolean
  onLoadMore: () => void
  root?: Element | null
  rootMargin?: string
}) {
  return useCallback(
    (node: HTMLElement | null) => {
      if (!node || !enabled) return
      let requested = false
      let active = true
      const observer = new IntersectionObserver(
        (entries) => {
          if (
            active &&
            !requested &&
            entries.some((entry) => entry.isIntersecting)
          ) {
            requested = true
            onLoadMore()
          }
        },
        { root, rootMargin },
      )
      observer.observe(node)
      return () => {
        active = false
        observer.disconnect()
      }
      // A new page must recheck visibility even when loadNext resolves from cache.
    },
    [enabled, onLoadMore, root, rootMargin],
  )
}
