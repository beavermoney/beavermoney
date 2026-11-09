import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { useNavigate } from '@tanstack/react-router'
import { SearchXIcon } from 'lucide-react'

export function NotFoundError() {
  const { t } = useLingui()
  const navigate = useNavigate()

  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={2}>
        <Stack direction="vertical" gap={4}>
          <AstryxIcon icon={SearchXIcon} />
        </Stack>
        <Heading level={2}>
          <Trans>Page not found</Trans>
        </Heading>
        <Stack direction="vertical" gap={4}>
          <Trans>
            We could not find what you were looking for. It may have been moved
            or deleted.
          </Trans>
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={4}>
        <Button
          onClick={() => navigate({ to: '..' })}
          label={t`Go back`}
          variant={'secondary'}
        >
          <Trans>Go back</Trans>
        </Button>
        <Button
          onClick={() => navigate({ to: '/' })}
          label={t`Go home`}
          variant={'primary'}
        >
          <Trans>Go home</Trans>
        </Button>
      </Stack>
    </Stack>
  )
}
