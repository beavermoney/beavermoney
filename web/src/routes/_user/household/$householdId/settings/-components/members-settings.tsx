import { graphql } from 'relay-runtime'
import { useFragment, useMutation } from 'react-relay'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import { toast } from 'sonner'
import { useState } from 'react'
import { MoreVerticalIcon } from 'lucide-react'

import type { membersSettingsFragment$key } from './__generated__/membersSettingsFragment.graphql'
import type { membersSettingsUpdateRoleMutation } from './__generated__/membersSettingsUpdateRoleMutation.graphql'
import type { membersSettingsRemoveMutation } from './__generated__/membersSettingsRemoveMutation.graphql'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useUser } from '@/hooks/use-user'
import { useUserHousehold } from '@/hooks/use-user-household'
import { commitMutationResult } from '@/lib/relay'
import { AddMemberDialog } from './add-member-dialog'

const membersSettingsFragment = graphql`
  fragment membersSettingsFragment on Household {
    id
    userHouseholds {
      id
      role
      householdCurrency {
        code
      }
      user {
        id
        name
        email
        isSynthetic
      }
    }
    ...addMemberDialogFragment
  }
`

const updateRoleMutation = graphql`
  mutation membersSettingsUpdateRoleMutation(
    $id: ID!
    $role: UserHouseholdRole!
  ) {
    updateHouseholdUserRole(id: $id, role: $role) {
      id
      role
    }
  }
`

const removeMutation = graphql`
  mutation membersSettingsRemoveMutation($id: ID!) {
    removeHouseholdUser(id: $id) {
      removedUserHouseholdID
    }
  }
`

function getRoleErrorMessage(error: unknown): string {
  const msg = String(error)
  if (msg.includes('LAST_ADMIN_PROTECTED'))
    return 'At least one admin must remain.'
  if (msg.includes('NOT_HOUSEHOLD_ADMIN'))
    return 'Only household admins can change roles.'
  if (msg.includes('SYNTHETIC_USER_ROLE_CHANGE_NOT_ALLOWED'))
    return "The joint owner's role is fixed and can't be changed."
  if (msg.includes('MEMBER_MUTATION_LOCKED_ON_DEMO_HOUSEHOLD'))
    return 'Member changes are disabled on the demo household.'
  return 'Something went wrong. Please try again.'
}

function getRemoveErrorMessage(error: unknown): string {
  const msg = String(error)
  if (msg.includes('LAST_ADMIN_PROTECTED'))
    return 'At least one admin must remain.'
  if (msg.includes('MEMBER_HAS_OWNED_RECORDS'))
    return 'This member or the joint owner owns accounts, investments, or subscriptions. Remove or archive them first.'
  if (msg.includes('SELF_REMOVAL_NOT_ALLOWED'))
    return "You can't remove yourself from the household."
  if (msg.includes('SYNTHETIC_USER_REMOVAL_NOT_ALLOWED'))
    return "The joint owner can't be removed directly. Remove your partner instead and the joint owner will be cleaned up."
  if (msg.includes('NOT_HOUSEHOLD_ADMIN'))
    return 'Only household admins can remove members.'
  if (msg.includes('MEMBER_MUTATION_LOCKED_ON_DEMO_HOUSEHOLD'))
    return 'Member changes are disabled on the demo household.'
  return 'Something went wrong. Please try again.'
}

type MembersSettingsProps = {
  householdRef: membersSettingsFragment$key
}

export function MembersSettings({ householdRef }: MembersSettingsProps) {
  const household = useFragment(membersSettingsFragment, householdRef)
  const { user } = useUser()
  const { userHousehold } = useUserHousehold()

  invariant(household.userHouseholds, 'userHouseholds is required')

  const isAdmin = userHousehold.role === 'admin'
  const householdId = household.id
  const realMemberCount = household.userHouseholds.filter(
    (uh) => !uh.user.isSynthetic,
  ).length
  const canInviteMore = realMemberCount < 2

  const [commitUpdateRole, isUpdateRoleInFlight] =
    useMutation<membersSettingsUpdateRoleMutation>(updateRoleMutation)
  const [commitRemove, isRemoveInFlight] =
    useMutation<membersSettingsRemoveMutation>(removeMutation)

  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null)

  const handleRoleChange = async (
    userHouseholdId: string,
    nextRole: 'admin' | 'member',
  ) => {
    const result =
      await commitMutationResult<membersSettingsUpdateRoleMutation>(
        commitUpdateRole,
        {
          variables: {
            id: userHouseholdId,
            role: nextRole,
          },
          updater: (store) => {
            store.get(householdId)?.invalidateRecord()
          },
        },
      )

    match(result)
      .with({ status: 'success' }, () => {
        toast.success(
          nextRole === 'admin'
            ? 'Member promoted to admin.'
            : 'Admin demoted to member.',
        )
      })
      .with({ status: 'error' }, ({ error }) => {
        toast.error(getRoleErrorMessage(error))
      })
      .exhaustive()
  }

  const handleConfirmRemove = async () => {
    if (removeTargetId === null) return

    const result = await commitMutationResult<membersSettingsRemoveMutation>(
      commitRemove,
      {
        variables: {
          id: removeTargetId,
        },
        updater: (store) => {
          store.get(householdId)?.invalidateRecord()
        },
      },
    )

    match(result)
      .with({ status: 'success' }, () => {
        toast.success('Member removed.')
        setRemoveTargetId(null)
      })
      .with({ status: 'error' }, ({ error }) => {
        toast.error(getRemoveErrorMessage(error))
      })
      .exhaustive()
  }

  return (
    <div className="flex max-w-md flex-col gap-3">
      {isAdmin && canInviteMore && (
        <div>
          <AddMemberDialog householdRef={household} />
        </div>
      )}
      <ItemGroup>
        {household.userHouseholds.map((uh) => {
          const isCurrentUser = uh.user.id === user.id
          const isSynthetic = uh.user.isSynthetic
          const showActions = isAdmin && !isCurrentUser && !isSynthetic
          const nextRole: 'admin' | 'member' =
            uh.role === 'admin' ? 'member' : 'admin'
          return (
            <Item key={uh.id} variant="outline" size="sm">
              <ItemContent>
                <ItemTitle>
                  {uh.user.name}
                  {isCurrentUser && (
                    <span className="text-muted-foreground font-normal">
                      (you)
                    </span>
                  )}
                  <Badge variant={'outline'}>{uh.householdCurrency.code}</Badge>
                </ItemTitle>
                {uh.user.email && (
                  <ItemDescription>{uh.user.email}</ItemDescription>
                )}
                {isSynthetic && (
                  <ItemDescription>Shared owner — auto-managed</ItemDescription>
                )}
              </ItemContent>
              {isSynthetic ? (
                <Badge variant="outline">joint</Badge>
              ) : (
                <Badge variant={uh.role === 'admin' ? 'default' : 'secondary'}>
                  {uh.role}
                </Badge>
              )}
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer"
                        aria-label={`Actions for ${uh.user.name}`}
                      />
                    }
                  >
                    <MoreVerticalIcon className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      disabled={isUpdateRoleInFlight}
                      onClick={() => handleRoleChange(uh.id, nextRole)}
                    >
                      {uh.role === 'admin' ? 'Make member' : 'Make admin'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setRemoveTargetId(uh.id)}
                    >
                      Remove from household
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </Item>
          )
        })}
      </ItemGroup>

      <AlertDialog
        open={removeTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTargetId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove them from the household. They will lose access
              immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isRemoveInFlight}
              onClick={handleConfirmRemove}
            >
              {isRemoveInFlight ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
