import { LOCAL_STORAGE_HOUSEHOLD_ID_KEY } from '@/constant'
import { environment } from '@/environment'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { fetchQuery, graphql } from 'relay-runtime'
import type { householdQuery } from './__generated__/householdQuery.graphql'

const query = graphql`
  query householdQuery {
    households {
      id
    }
  }
`

export const Route = createFileRoute('/_user/household/')({
  loader: async () => {
    const data = await fetchQuery<householdQuery>(
      environment,
      query,
      {},
      {
        fetchPolicy: 'store-or-network',
      },
    ).toPromise()
    const saved = localStorage.getItem(LOCAL_STORAGE_HOUSEHOLD_ID_KEY)
    const householdId =
      data?.households.find((h) => h.id === saved)?.id ??
      data?.households[0]?.id
    if (!householdId) throw redirect({ to: '/household/new', replace: true })
    localStorage.setItem(LOCAL_STORAGE_HOUSEHOLD_ID_KEY, householdId)
    // Redirect during preparation, rather than briefly rendering an empty page.
    throw redirect({
      to: '/household/$householdId/transactions',
      params: { householdId },
      replace: true,
    })
  },
})
