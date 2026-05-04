import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_user/household/$householdId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Navigate
      from="/household/$householdId"
      to="/household/$householdId/transactions"
    />
  )
}
