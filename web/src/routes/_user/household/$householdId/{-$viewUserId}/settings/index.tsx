import { Navigate, createFileRoute } from '@tanstack/react-router'
import { identity } from 'lodash-es'

export const Route = createFileRoute(
  '/_user/household/$householdId/{-$viewUserId}/settings/',
)({
  component: () => (
    <Navigate
      from="/household/$householdId/{-$viewUserId}/settings"
      to="/household/$householdId/{-$viewUserId}/settings/general"
      search={identity}
    />
  ),
})
