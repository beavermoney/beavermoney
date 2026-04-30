import {
  LOCAL_STORAGE_HOUSEHOLD_ID_KEY,
  LOCAL_STORAGE_TOKEN_KEY,
  LOCAL_STORAGE_VIEW_USER_ID_KEY_PREFIX,
} from '@/constant'

export function logout() {
  localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
  localStorage.removeItem(LOCAL_STORAGE_HOUSEHOLD_ID_KEY)
}

// Detects when a household-scoped GraphQL query fails because the caller is
// no longer a member of the active household. Patterns map to:
//   - ent NotFoundError after privacy filter rejects the row
//     ("ent: household not found", "ent: user_household not found")
//   - privacy.Denyf messages from privacy rules in ent/rules/privacy.go
//     ("FilterMemberHousehold", "missing household context")
// Keep in sync with backend privacy rule names.
export function isMembershipRevokedError(error: unknown): boolean {
  if (!error) return false
  const msg = error instanceof Error ? error.message : String(error)
  if (!msg) return false
  const lower = msg.toLowerCase()
  return (
    lower.includes('household not found') ||
    lower.includes('user_household not found') ||
    lower.includes('userhousehold not found') ||
    lower.includes('filtermemberhousehold') ||
    lower.includes('filtercomembers') ||
    lower.includes('unauthenticated member household') ||
    lower.includes('missing household context')
  )
}

export function clearHouseholdScopedStorage(householdId: string) {
  localStorage.removeItem(LOCAL_STORAGE_HOUSEHOLD_ID_KEY)
  localStorage.removeItem(LOCAL_STORAGE_VIEW_USER_ID_KEY_PREFIX + householdId)
}
