import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_user/household/$householdId/settings/')(
  {
    component: () => (
      <Navigate
        from="/household/$householdId/settings"
        to="/household/$householdId/settings/general"
      />
    ),
  },
)
