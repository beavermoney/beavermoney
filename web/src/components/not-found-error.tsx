import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { useNavigate } from '@tanstack/react-router'
import { SearchXIcon } from 'lucide-react'

export function NotFoundError() {
  const navigate = useNavigate()

  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={2}>
        <Stack direction="vertical" gap={4}>
          <AstryxIcon icon={SearchXIcon} />
        </Stack>
        <Heading level={2}>Page not found</Heading>
        <Stack direction="vertical" gap={4}>
          We could not find what you were looking for. It may have been moved or
          deleted.
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
