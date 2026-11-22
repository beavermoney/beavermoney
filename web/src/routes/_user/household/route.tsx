import { NotLoggedInError } from '@/components/not-logged-in-error'
import {
  ErrorComponentProps,
  Outlet,
  ErrorComponent as TanStackErrorComponent,
  createFileRoute,
} from '@tanstack/react-router'
import { HTTPError } from 'ky'

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
})

function RouteComponent() {
  return <Outlet />
}
