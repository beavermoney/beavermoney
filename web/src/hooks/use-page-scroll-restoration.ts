import { getHistoryViewKey } from '@/lib/history-view-key'
import { useCallback } from 'react'
import {
  useElementScrollRestoration,
  useRouterState,
} from '@tanstack/react-router'
import { restoreScrollPosition } from '@/lib/restore-scroll-position'

export function usePageScrollRestoration(id = 'page-content') {
  const key = useRouterState({
    select: (state) => getHistoryViewKey(state.location),
  })
  const position = useElementScrollRestoration({
    id,
    getKey: getHistoryViewKey,
  })
  const scrollX = position?.scrollX
  const scrollY = position?.scrollY
  return useCallback(
    (node: HTMLElement | null) => {
      if (!node || scrollX === undefined || scrollY === undefined) return
      return restoreScrollPosition(node, { scrollX, scrollY })
    },
    // The ref must reattach for each history entry, even at identical offsets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, scrollX, scrollY],
  )
}
