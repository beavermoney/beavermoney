import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { DropdownMenu, DropdownMenuItem } from '@astryxdesign/core/DropdownMenu'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { ListItem } from '@astryxdesign/core/List'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useToast } from '@astryxdesign/core/Toast'
import { MoreVerticalIcon } from 'lucide-react'
import { useState } from 'react'
import { useFragment, useMutation } from 'react-relay'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'

import type { membersSettingsFragment$key } from './__generated__/membersSettingsFragment.graphql'
import type { membersSettingsRemoveMutation } from './__generated__/membersSettingsRemoveMutation.graphql'
import type { membersSettingsUpdateRoleMutation } from './__generated__/membersSettingsUpdateRoleMutation.graphql'

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
  const showToast = useToast()

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
        showToast({
          type: 'info',
          body:
            nextRole === 'admin'
              ? 'Member promoted to admin.'
              : 'Admin demoted to member.',
        })
      })
      .with({ status: 'error' }, ({ error }) => {
        showToast({ type: 'error', body: getRoleErrorMessage(error) })
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
        showToast({ type: 'info', body: 'Member removed.' })
        setRemoveTargetId(null)
      })
      .with({ status: 'error' }, ({ error }) => {
        showToast({ type: 'error', body: getRemoveErrorMessage(error) })
      })
      .exhaustive()
  }

  return (
    <Stack direction="vertical" gap={3}>
      {isAdmin && canInviteMore && (
        <Stack direction="vertical" gap={4}>
          <AddMemberDialog householdRef={household} />
        </Stack>
      )}
      <Stack direction="vertical" gap={2}>
        {household.userHouseholds.map((uh) => {
          const isCurrentUser = uh.user.id === user.id
          const isSynthetic = uh.user.isSynthetic
          const showActions = isAdmin && !isCurrentUser && !isSynthetic
          const nextRole: 'admin' | 'member' =
            uh.role === 'admin' ? 'member' : 'admin'
          return (
            <ListItem
              key={uh.id}
              label={uh.user.name + (isCurrentUser ? ' (you)' : '')}
              description={
                isSynthetic ? 'Shared owner — auto-managed' : uh.user.email
              }
              endContent={
                <Stack direction="horizontal" gap={2} align="center">
                  <Badge label={uh.householdCurrency.code} />
                  <Badge label={isSynthetic ? 'joint' : uh.role} />
                  {showActions && (
                    <DropdownMenu
                      alignment={'end'}
                      renderTrigger={(triggerProps) => (
                        <Button
                          {...triggerProps}

                          label={`Actions for ${uh.user.name}`}
                          variant={'ghost'}

                          isIconOnly
                          icon={
                            <>
                              <AstryxIcon icon={MoreVerticalIcon} />
                            </>
                          }
                        ></Button>
                      )}
                    >
                      <DropdownMenuItem
                        isDisabled={isUpdateRoleInFlight}
                        onClick={() => handleRoleChange(uh.id, nextRole)}
                        label={
                          <>
                            {uh.role === 'admin' ? 'Make member' : 'Make admin'}
                          </>
                        }
                      />
                      <DropdownMenuItem
                        onClick={() => setRemoveTargetId(uh.id)}
                        label={<>Remove from household</>}
                      />
                    </DropdownMenu>
                  )}
                </Stack>
              }
            />
          )
        })}
      </Stack>

      <>
        <Dialog
          isOpen={removeTargetId !== null}
          onOpenChange={(open) => {
            if (!open) setRemoveTargetId(null)
          }}
          purpose="form"
          role="alertdialog"
        >
          <DialogHeader
            title={<>Remove member?</>}
            onOpenChange={(open) => {
              if (!open) setRemoveTargetId(null)
            }}
          />
          <Text as="div" display="block" type="supporting">
            This will remove them from the household. They will lose access
            immediately.
          </Text>
          <Stack
            direction="horizontal"
            gap={3}
            align="center"
            wrap="wrap"
            justify="end"
          >
            <Button
              label="Cancel"
              onClick={() =>
                ((open) => {
                  if (!open) setRemoveTargetId(null)
                })(false)
              }
            />
            <Button
              variant="destructive"
              isDisabled={isRemoveInFlight}
              onClick={handleConfirmRemove}
              label="Remove member"
            >
              {isRemoveInFlight ? 'Removing...' : 'Remove'}
            </Button>
          </Stack>
        </Dialog>
      </>
    </Stack>
  )
}
