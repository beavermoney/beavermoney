import { Link } from '@tanstack/react-router'
import type { LinkOptions } from '@tanstack/react-router'
import { Button } from './ui/button'
import { PlusIcon } from 'lucide-react'

type PlusButtonProps = LinkOptions & {
  disabled?: boolean
  disabledTitle?: string
  'data-testid'?: string
}

export const PlusButton = ({
  disabled,
  disabledTitle,
  'data-testid': dataTestId,
  ...linkProps
}: PlusButtonProps) => {
  if (disabled) {
    return (
      <Button
        nativeButton={true}
        size="icon-xl"
        className="rounded-full"
        disabled
        aria-disabled="true"
        title={disabledTitle}
        data-testid={dataTestId}
      >
        <PlusIcon />
      </Button>
    )
  }

  return (
    <Link {...linkProps}>
      <Button
        nativeButton={true}
        size="icon-xl"
        className="rounded-full"
        data-testid={dataTestId}
      >
        <PlusIcon />
      </Button>
    </Link>
  )
}
