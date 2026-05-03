import { ErrorComponentProps, useNavigate } from '@tanstack/react-router'
import { SearchXIcon } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  clearHouseholdScopedStorage,
  isMembershipRevokedError,
} from '@/lib/auth'

export function GenericError(error: ErrorComponentProps) {
  const navigate = useNavigate()
  const isRevoked = isMembershipRevokedError(error.error)

  useEffect(() => {
    if (!isRevoked) return
    clearHouseholdScopedStorage()
    toast.error('You no longer have access to this household.')
    navigate({ to: '/household' })
  }, [isRevoked, navigate])

  if (isRevoked) {
    return null
  }

  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>Something went wrong :(</EmptyTitle>
        <EmptyDescription>{error.error.message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="max-w-none flex-row justify-center">
        <Button
          className="cursor-pointer"
          variant="outline"
          onClick={() => navigate({ to: '..' })}
        >
          Go back
        </Button>
        <Button
          className="cursor-pointer"
          onClick={() => navigate({ to: '/' })}
        >
          Go home
        </Button>
      </EmptyContent>
    </Empty>
  )
}
