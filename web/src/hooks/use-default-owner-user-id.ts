import { useMemo } from 'react'
import { useStore } from '@tanstack/react-store'
import { useParams } from '@tanstack/react-router'
import { viewScopeStore } from './view-scope-store'

// Picks the owner ID a create-form should default to, given the current view
// scope and the authenticated user. Rules (per the multi-user design):
//
//   1. Combined view (viewUserIds === null) → current user.
//   2. Exactly one selected → that owner (could be a partner or the joint
//      synthetic user).
//   3. Multi-select including the current user → current user.
//   4. Multi-select that excludes the current user → first selected.
//
// If candidateOwnerIDs is provided, the result is constrained to that set; if
// the rule-based pick is missing from it, we fall back to candidateOwnerIDs[0]
// (or, lastly, currentUserID). This keeps forms from defaulting to an ID that
// isn't a valid option for that form (e.g. an account creator that excludes
// the synthetic user).
export function useDefaultOwnerUserID(
  currentUserID: string,
  candidateOwnerIDs?: ReadonlyArray<string>,
): string {
  const { householdId } = useParams({
    from: '/_user/household/$householdId',
  })
  const viewUserIds = useStore(
    viewScopeStore,
    (state) => state[householdId] ?? null,
  )

  return useMemo(() => {
    const isAllowed = (id: string) =>
      candidateOwnerIDs === undefined || candidateOwnerIDs.includes(id)

    const fallback =
      candidateOwnerIDs && candidateOwnerIDs.length > 0
        ? candidateOwnerIDs[0]
        : currentUserID

    if (viewUserIds === null) {
      return isAllowed(currentUserID) ? currentUserID : fallback
    }
    if (viewUserIds.length === 1 && isAllowed(viewUserIds[0])) {
      return viewUserIds[0]
    }
    if (viewUserIds.includes(currentUserID) && isAllowed(currentUserID)) {
      return currentUserID
    }
    const firstAllowed = viewUserIds.find(isAllowed)
    return firstAllowed ?? fallback
  }, [viewUserIds, currentUserID, candidateOwnerIDs])
}
