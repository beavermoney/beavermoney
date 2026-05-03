import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_user/household/$householdId/{-$viewUserId}/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Navigate
      from="/household/$householdId/{-$viewUserId}"
      to="/household/$householdId/{-$viewUserId}/transactions"
    />
  )
}
