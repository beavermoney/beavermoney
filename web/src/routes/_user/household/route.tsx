import {
  ErrorComponentProps,
  Outlet,
  createFileRoute,
} from '@tanstack/react-router'
import { HTTPError } from 'ky'
import { NotLoggedInError } from '@/components/not-logged-in-error'
import { ErrorComponent as TanStackErrorComponent } from '@tanstack/react-router'
import { fetchQuery, ROOT_ID } from 'relay-runtime'
import { PendingComponent } from '@/components/pending-component'
import { loadQuery, useSubscribeToInvalidationState } from 'react-relay'
import { environment } from '@/environment'
import { HouseholdQuery } from './__generated__/HouseholdQuery.graphql'
import { householdQuery } from './-household-query'

function ErrorComponent(error: ErrorComponentProps) {
  if (error.error instanceof HTTPError) {
    if (error.error.response.status === 401) {
      return <NotLoggedInError />
    }
  }

  return <TanStackErrorComponent error={error} />
}

export const Route = createFileRoute('/_user/household')({
  component: RouteComponent,
  beforeLoad: async () => {
    await fetchQuery<HouseholdQuery>(
      environment,
      householdQuery,
      {},
    ).toPromise()
    return loadQuery<HouseholdQuery>(
      environment,
      householdQuery,
      {},
      { fetchPolicy: 'store-only' },
    )
  },
  errorComponent: ErrorComponent,
  pendingComponent: PendingComponent,
})

function RouteComponent() {
  useSubscribeToInvalidationState([ROOT_ID], () => {
    fetchQuery(
      environment,
      householdQuery,
      {},
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return <Outlet />
}
