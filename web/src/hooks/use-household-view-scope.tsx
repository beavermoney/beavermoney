import { useStore } from '@tanstack/react-store'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { identity } from 'lodash-es'
import {
  clearViewUserId,
  setViewUserId as storeSetViewUserId,
  viewUserIdStore,
} from './view-scope-store'

export function useHouseholdViewScope() {
  const search = useSearch({ strict: false })
  const urlViewUserId = (search as Record<string, unknown>).view_user_id as
    | string
    | null
    | undefined
  const storeViewUserId = useStore(viewUserIdStore, identity)
  const navigate = useNavigate({ from: '/household/$householdId' })

  const viewUserId =
    urlViewUserId !== undefined ? (urlViewUserId ?? null) : storeViewUserId

  const setViewUserId = (next: string | null) => {
    if (next === null) {
      clearViewUserId()
    } else {
      storeSetViewUserId(next)
    }

    void navigate({
      search: (prev: Record<string, unknown>) => {
        const nextSearch: Record<string, unknown> = { ...prev }

        if (next === null) {
          delete nextSearch.view_user_id
        } else {
          nextSearch.view_user_id = next
        }

        return nextSearch
      },
      replace: true,
    })
  }

  return {
    viewUserId,
    isCombined: viewUserId === null,
    setViewUserId,
  }
}
