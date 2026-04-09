import { graphql } from 'relay-runtime'
import { useFragment } from 'react-relay'

import type { membersSettingsFragment$key } from './__generated__/membersSettingsFragment.graphql'

import { Badge } from '@/components/ui/badge'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'

// eslint-disable-next-line react-refresh/only-export-components
export const membersSettingsFragment = graphql`
  fragment membersSettingsFragment on Household {
    userHouseholds {
      id
      role
      user {
        id
        name
        email
      }
    }
  }
`

type MembersSettingsProps = {
  householdRef: membersSettingsFragment$key
  userId: string
}

export function MembersSettings({
  householdRef,
  userId,
}: MembersSettingsProps) {
  const { userHouseholds } = useFragment(membersSettingsFragment, householdRef)

  const members = userHouseholds ?? []

  return (
    <div className="flex max-w-md flex-col gap-3">
      <ItemGroup>
        {members.map((uh) => {
          const isCurrentUser = uh.user.id === userId
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
                </ItemTitle>
                <ItemDescription>{uh.user.email}</ItemDescription>
              </ItemContent>
              <Badge variant={uh.role === 'admin' ? 'default' : 'secondary'}>
                {uh.role}
              </Badge>
            </Item>
          )
        })}
      </ItemGroup>
      <p className="text-muted-foreground text-xs/relaxed">
        Invite and role management coming soon.
      </p>
    </div>
  )
}
