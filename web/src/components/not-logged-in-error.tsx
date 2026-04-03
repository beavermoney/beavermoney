import { useNavigate } from '@tanstack/react-router'
import { ShieldAlertIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

export function NotLoggedInError() {
  const navigate = useNavigate()

  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldAlertIcon />
        </EmptyMedia>
        <EmptyTitle>You are not logged in</EmptyTitle>
        <EmptyDescription>
          Your session may have expired. Please log in again to continue.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="max-w-none flex-row justify-center">
        <Button
          className="cursor-pointer"
          variant="outline"
          onClick={() => navigate({ to: '/' })}
        >
          Go home
        </Button>
        <Button
          className="cursor-pointer"
          onClick={() => navigate({ to: '/login' })}
        >
          Go to login
        </Button>
      </EmptyContent>
    </Empty>
  )
}
