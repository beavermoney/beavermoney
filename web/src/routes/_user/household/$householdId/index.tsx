import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_user/household/$householdId/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/household/$householdId/transactions',
      params,
      replace: true,
    })
  },
})
