import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { useNavigate } from '@tanstack/react-router'
import { ShieldAlertIcon } from 'lucide-react'

export function NotLoggedInError() {
  const { t } = useLingui()
  const navigate = useNavigate()

  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={2}>
        <Stack direction="vertical" gap={4}>
          <AstryxIcon icon={ShieldAlertIcon} />
        </Stack>
        <Heading level={2}>
          <Trans>You are not logged in</Trans>
        </Heading>
        <Stack direction="vertical" gap={4}>
          <Trans>
            Your session may have expired. Please log in again to continue.
          </Trans>
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={4}>
        <Button
          onClick={() => navigate({ to: '/' })}
          label={t`Go home`}
          variant={'secondary'}
        >
          <Trans>Go home</Trans>
        </Button>
        <Button
          onClick={() => navigate({ to: '/login' })}
          label={t`Go to login`}
          variant={'primary'}
        >
          <Trans>Go to login</Trans>
        </Button>
      </Stack>
    </Stack>
  )
}
