import { useNavigate } from '@tanstack/react-router'
import { SearchXIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

export function NotFoundError() {
  const navigate = useNavigate()

  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>Page not found</EmptyTitle>
        <EmptyDescription>
          We could not find what you were looking for. It may have been moved or
          deleted.
        </EmptyDescription>
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
