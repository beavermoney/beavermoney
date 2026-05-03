import { graphql } from 'relay-runtime'
import { useFragment } from 'react-relay'
import { CheckIcon, ChevronDownIcon, UserIcon, UsersIcon } from 'lucide-react'
import type { viewScopeSwitcherFragment$key } from './__generated__/viewScopeSwitcherFragment.graphql'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { cn } from '@/lib/utils'

const ViewScopeSwitcherFragment = graphql`
  fragment viewScopeSwitcherFragment on Household {
    userHouseholds {
      id
      # eslint-disable-next-line relay/unused-fields
      role
      user {
        id
        name
        # eslint-disable-next-line relay/unused-fields
        email
      }
    }
  }
`

type ViewScopeSwitcherProps = {
  fragmentRef: viewScopeSwitcherFragment$key
}

export function ViewScopeSwitcher({ fragmentRef }: ViewScopeSwitcherProps) {
  const data = useFragment(ViewScopeSwitcherFragment, fragmentRef)
  const { viewUserId, setViewUserId } = useHouseholdViewScope()

  const userHouseholds = data.userHouseholds ?? []

  if (userHouseholds.length <= 1) {
    return null
  }

  const activeMember =
    viewUserId === null
      ? null
      : (userHouseholds.find((uh) => uh.user.id === viewUserId) ?? null)

  const activeLabel = activeMember?.user.name ?? 'Combined'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-10 cursor-pointer gap-1 rounded-none px-3 text-xs"
            data-testid="view-scope-switcher-trigger"
          >
            {activeMember ? (
              <UserIcon className="size-3" />
            ) : (
              <UsersIcon className="size-3" />
            )}
            {activeLabel}
            <ChevronDownIcon className="size-3" />
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setViewUserId(null)}
          className={cn('gap-2', viewUserId === null && 'font-bold')}
        >
          <CheckIcon
            className={cn(
              'size-3',
              viewUserId === null ? 'opacity-100' : 'opacity-0',
            )}
          />
          <UsersIcon className="size-3" />
          Combined
        </DropdownMenuItem>
        {userHouseholds.map((uh) => (
          <DropdownMenuItem
            key={uh.id}
            onClick={() => setViewUserId(uh.user.id)}
            className={cn('gap-2', viewUserId === uh.user.id && 'font-bold')}
          >
            <CheckIcon
              className={cn(
                'size-3',
                viewUserId === uh.user.id ? 'opacity-100' : 'opacity-0',
              )}
            />
            <UserIcon className="size-3" />
            {uh.user.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
