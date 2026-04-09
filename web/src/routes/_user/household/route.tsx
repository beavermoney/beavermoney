import {
  ErrorComponentProps,
  Outlet,
  createFileRoute,
} from '@tanstack/react-router'
import { HTTPError } from 'ky'
import { NotLoggedInError } from '@/components/not-logged-in-error'
import { ErrorComponent as TanStackErrorComponent } from '@tanstack/react-router'
import { PendingComponent } from '@/components/pending-component'

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
  errorComponent: ErrorComponent,
  pendingComponent: PendingComponent,
})

function RouteComponent() {
  return <Outlet />
}
