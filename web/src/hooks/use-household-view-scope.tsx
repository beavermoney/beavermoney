import { useStore } from '@tanstack/react-store'
import { useRouter } from '@tanstack/react-router'
import { identity } from 'lodash-es'
import {
  clearViewUserId,
  setViewUserId as storeSetViewUserId,
  viewUserIdStore,
} from './view-scope-store'

export function useHouseholdViewScope() {
  const viewUserId = useStore(viewUserIdStore, identity)
  const router = useRouter()

  const setViewUserId = (next: string | null) => {
    if (next === null) {
      clearViewUserId()
    } else {
      storeSetViewUserId(next)
    }
    void router.invalidate()
  }

  return {
    viewUserId,
    isCombined: viewUserId === null,
    setViewUserId,
  }
}
