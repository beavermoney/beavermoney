import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_user/household/$householdId/settings/')(
  {
    beforeLoad: ({ params }) => {
      throw redirect({
        to: '/household/$householdId/settings/general',
        params,
        replace: true,
      })
    },
  },
)
