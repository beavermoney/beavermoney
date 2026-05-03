import { Link } from '@tanstack/react-router'
import type { LinkOptions } from '@tanstack/react-router'
import { Button } from './ui/button'
import { PlusIcon } from 'lucide-react'

export const PlusButton = (props: LinkOptions) => {
  return (
    <Link {...props}>
      <Button
        nativeButton={true}
        size="icon-lg"
        className="size-10 [&_svg:not([class*='size-'])]:size-5"
      >
        <PlusIcon />
      </Button>
    </Link>
  )
}
