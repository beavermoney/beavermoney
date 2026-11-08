import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { useToast } from '@astryxdesign/core/Toast'
import { ErrorComponentProps, useNavigate } from '@tanstack/react-router'
import { SearchXIcon } from 'lucide-react'
import { useEffect } from 'react'

import {
  clearHouseholdScopedStorage,
  isMembershipRevokedError,
} from '@/lib/auth'

export function GenericError(error: ErrorComponentProps) {
  const showToast = useToast()

  const navigate = useNavigate()
  const isRevoked = isMembershipRevokedError(error.error)

  useEffect(() => {
    if (!isRevoked) return
    clearHouseholdScopedStorage()
    showToast({
      type: 'error',
      body: 'You no longer have access to this household.',
    })
    navigate({ to: '/household' })
  }, [isRevoked, navigate, showToast])

  if (isRevoked) {
    return null
  }

  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={2}>
        <Stack direction="vertical" gap={4}>
          <AstryxIcon icon={SearchXIcon} />
        </Stack>
        <Heading level={2}>Something went wrong :(</Heading>
        <Stack direction="vertical" gap={4}>
          {error.error instanceof Error
            ? error.error.message
            : 'An unexpected error occurred. Please try again.'}
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={4}>
        <Button
          onClick={() => navigate({ to: '..' })}
          label={'Go back'}
          variant={'secondary'}
        >
          Go back
        </Button>
        <Button
          onClick={() => navigate({ to: '/' })}
          label={'Go home'}
          variant={'primary'}
        >
          Go home
        </Button>
      </Stack>
    </Stack>
  )
}
