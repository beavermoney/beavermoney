import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { useNavigate } from '@tanstack/react-router'
import { ShieldAlertIcon } from 'lucide-react'

export function NotLoggedInError() {
  const navigate = useNavigate()

  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={2}>
        <Stack direction="vertical" gap={4}>
          <AstryxIcon icon={ShieldAlertIcon} />
        </Stack>
        <Heading level={2}>You are not logged in</Heading>
        <Stack direction="vertical" gap={4}>
          Your session may have expired. Please log in again to continue.
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={4}>
        <Button
          onClick={() => navigate({ to: '/' })}
          label={'Go home'}
          variant={'secondary'}
        >
          Go home
        </Button>
        <Button
          onClick={() => navigate({ to: '/login' })}
          label={'Go to login'}
          variant={'primary'}
        >
          Go to login
        </Button>
      </Stack>
    </Stack>
  )
}
