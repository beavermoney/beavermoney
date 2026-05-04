import { graphql } from 'relay-runtime'
import { useFragment } from 'react-relay'
import { UserIcon, UsersIcon } from 'lucide-react'
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
      user {
        id
        name
      }
    }
  }
`

type ViewScopeSwitcherProps = {
  fragmentRef: viewScopeSwitcherFragment$key
}

export function ViewScopeSwitcher({ fragmentRef }: ViewScopeSwitcherProps) {
  const data = useFragment(ViewScopeSwitcherFragment, fragmentRef)
  const { viewUserIds, isCombinedAll, setViewUserIds } = useHouseholdViewScope()

  const userHouseholds = data.userHouseholds ?? []

  if (userHouseholds.length <= 1) {
    return null
  }

  const activeMember =
    viewUserIds && viewUserIds.length === 1
      ? (userHouseholds.find((uh) => uh.user.id === viewUserIds[0]) ?? null)
      : null

  const activeLabel = activeMember?.user.name ?? 'Combined'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-10 cursor-pointer gap-1 rounded-none border-0 bg-clip-border px-3 text-xs"
            data-testid="view-scope-switcher-trigger"
          >
            {activeMember ? (
              <UserIcon className="size-4" />
            ) : (
              <UsersIcon className="size-4" />
            )}
            {activeLabel}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setViewUserIds(null)}
          className={cn('gap-2', isCombinedAll && 'font-bold')}
        >
          <UsersIcon className="size-4" />
          Combined
        </DropdownMenuItem>
        {userHouseholds.map((uh) => {
          const isActive = activeMember?.user.id === uh.user.id
          return (
            <DropdownMenuItem
              key={uh.id}
              onClick={() => setViewUserIds([uh.user.id])}
              className={cn('gap-2', isActive && 'font-bold')}
            >
              <UserIcon className="size-4" />
              {uh.user.name}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
